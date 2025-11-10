import { CognitoIdentityProviderClient, SignUpCommand, InitiateAuthCommand, RespondToAuthChallengeCommand, AdminConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import User from "../models/User.js"; // Your MongoDB User model
import dbConnect from '../lib/dbConnect.js';

const cognitoClient = new CognitoIdentityProviderClient({ region: "ap-south-1" }); // e.g., "ap-south-1"


// This is your updated startAuth function
// This is your new, fully corrected startAuth function
const startAuth = async (req, res) => {
    const { phone } = req.body;
    const clientId = process.env.COGNITO_APP_CLIENT_ID;
    const userPoolId = process.env.COGNITO_USER_POOL_ID;

    try {
        await dbConnect();

        // --- Step 1: Try to create the user ---
        const signUpParams = {
            ClientId: clientId,
            Username: phone,
            Password: `aB1!${Date.now()}`, // Dummy password
            UserAttributes: [{ Name: "phone_number", Value: phone }],
        };
        await cognitoClient.send(new SignUpCommand(signUpParams));
        console.log(`Successfully created new user: ${phone}`);

    } catch (err) {
        if (err.name === "UsernameExistsException") {
            // This is OK. It just means the user is already in Cognito.
            console.log(`User ${phone} already exists.`);
        } else {
            // A different, unexpected error
            console.error("CRITICAL SIGNUP ERROR:", err);
            return res.status(500).json({ msg: "Failed during sign-up", error: err.name });
        }
    }

    // --- Step 2: Admin-confirm the user ---
    // We run this for *both* new users and existing (but possibly unconfirmed) users.
    // This is the key fix.
    try {
        const confirmParams = {
            UserPoolId: userPoolId,
            Username: phone,
        };
        await cognitoClient.send(new AdminConfirmSignUpCommand(confirmParams));
        console.log(`Admin-confirmed user: ${phone}`);
    } catch (err) {
        // If this fails, it's 100% an IAM permission problem.
        console.error("CRITICAL ADMIN CONFIRM ERROR:", err);
        return res.status(500).json({ msg: "Failed during admin confirmation", error: err.name });
    }

    // --- Step 3: Initiate the login flow ---
    // Now that the user is 100% CONFIRMED, this will work.
    try {
        const authParams = {
            ClientId: clientId,
            AuthFlow: "CUSTOM_AUTH",
            AuthParameters: { USERNAME: phone },
        };
        const response = await cognitoClient.send(new InitiateAuthCommand(authParams));
        res.status(200).json({ session: response.Session, msg: "OTP sent successfully." });

    } catch (err) {
        console.error("Cognito InitiateAuth Error:", err);
        res.status(500).json({ msg: "Failed to send OTP.", error: err.name });
    }
};

const verifyOtp = async (req, res) => {
    const { phone, otp, session } = req.body;
    const clientId = process.env.COGNITO_APP_CLIENT_ID;

    // --- FIX: This block defines the 'params' object ---
    const params = {
        ClientId: clientId,
        ChallengeName: "CUSTOM_CHALLENGE",
        Session: session,
        ChallengeResponses: {
            USERNAME: phone,
            ANSWER: otp,
        },
    };
    // --------------------------------------------------

    try {
        await dbConnect();
        // Now 'params' exists and this command will work
        const response = await cognitoClient.send(new RespondToAuthChallengeCommand(params));
        
        const idToken = response.AuthenticationResult.IdToken;
        const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
        const cognitoUserId = payload.sub;
        
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
