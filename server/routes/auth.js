import { CognitoIdentityProviderClient, SignUpCommand, InitiateAuthCommand, RespondToAuthChallengeCommand, AdminConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import User from "../models/User.js"; // Your MongoDB User model
import dbConnect from '../lib/dbConnect.js';

const cognitoClient = new CognitoIdentityProviderClient({ region: "ap-south-1" }); // e.g., "ap-south-1"


// This is your updated startAuth function
const startAuth = async (req, res) => {
    const { phone } = req.body;
    const clientId = process.env.COGNITO_APP_CLIENT_ID;
    const userPoolId = process.env.COGNITO_USER_POOL_ID;

    try {
        await dbConnect();

        // We will try to sign up the user.
        const signUpParams = {
            ClientId: clientId,
            Username: phone,
            Password: `aB1!${Date.now()}`, // Dummy password
            UserAttributes: [{ Name: "phone_number", Value: phone }],
        };

        await cognitoClient.send(new SignUpCommand(signUpParams));

        // After creating the user, immediately confirm them.
        const confirmParams = {
            UserPoolId: userPoolId,
            Username: phone,
        };
        await cognitoClient.send(new AdminConfirmSignUpCommand(confirmParams));

        console.log(`Successfully created and confirmed new user: ${phone}`);

    } catch (err) {
        // This is the new, improved catch block
        if (err.name === "UsernameExistsException") {
            // This is fine, the user already exists. We'll just log in.
            console.log(`User ${phone} already exists, proceeding to login.`);
        } else {
            // This is the REAL error.
            // It's probably 'AccessDeniedException' or 'NotAuthorizedException'.
            console.error("CRITICAL SIGNUP/CONFIRM ERROR:", err);
            return res.status(500).json({ msg: "Failed during admin confirmation", error: err.name });
        }
    }

    // Now, initiate the authentication flow which will send the OTP
    try {
        const authParams = {
            ClientId: clientId,
            AuthFlow: "CUSTOM_AUTH",
            AuthParameters: { USERNAME: phone },
        };
        const response = await cognitoClient.send(new InitiateAuthCommand(authParams));
        res.status(200).json({ session: response.Session, msg: "OTP sent successfully." });

    } catch (err) {
        // This error might be 'UserNotConfirmedException' if the admin confirm failed
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
