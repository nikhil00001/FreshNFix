import { CognitoIdentityProviderClient, InitiateAuthCommand, RespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider";
import User from "../models/User.js"; // Your MongoDB User model
import dbConnect from '../lib/dbConnect.js';

const cognitoClient = new CognitoIdentityProviderClient({ region: "ap-south-1" }); // e.g., "ap-south-1"

// --- Step 1: Initiate Sign-Up / Sign-In with Phone ---
// We have REMOVED the entire 'SignUpCommand' block.
// Your CUSTOM_AUTH flow is responsible for handling both new and existing users.
const startAuth = async (req, res) => {
    const { phone } = req.body;
    const clientId = process.env.COGNITO_APP_CLIENT_ID;

    // Now, we *only* initiate the authentication flow.
    // This will trigger your Lambda functions on AWS.
    try {
        await dbConnect();
        const authParams = {
            ClientId: clientId,
            AuthFlow: "CUSTOM_AUTH",
            AuthParameters: { USERNAME: phone },
        };
        // This command will now succeed for BOTH new and existing users,
        // because the conflicting "SignUpCommand" is gone.
        const response = await cognitoClient.send(new InitiateAuthCommand(authParams));
        
        res.status(200).json({ session: response.Session, msg: "OTP sent successfully." });

    } catch (err) {
        // The 'UserNotConfirmedException' will no longer happen here.
        // This will only catch real errors.
        console.error("Cognito InitiateAuth Error:", err);
        res.status(500).json({ msg: "Failed to send OTP." });
    }
};

// This function was likely correct and does not need changes.
const verifyOtp = async (req, res) => {
    const { phone, otp, session } = req.body;
    const clientId = process.env.COGNITO_APP_CLIENT_ID;

    const params = {
        ClientId: clientId,
        ChallengeName: "CUSTOM_CHALLENGE",
        Session: session,
        ChallengeResponses: {
            USERNAME: phone,
            ANSWER: otp,
        },
    };

    try {
        await dbConnect();
        // Respond to the challenge
        const response = await cognitoClient.send(new RespondToAuthChallengeCommand(params));
        
        // Get the token and user details
        const idToken = response.AuthenticationResult.IdToken;
        const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
        const cognitoUserId = payload.sub;
        
        // Find or create the user in *your* MongoDB database
        let user = await User.findOne({ phone: phone });
        if (!user) {
            user = new User({ phone: phone, cognitoId: cognitoUserId, role: 'user' });
            await user.save();
        }

        res.json({ token: idToken });
    } catch (err) {
        console.error("Cognito VerifyOTP Error:", err);
        res.status(400).json({ msg: "Invalid or expired OTP." });
    }
};

export { startAuth, verifyOtp };
