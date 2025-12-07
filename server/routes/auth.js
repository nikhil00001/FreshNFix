import { CognitoIdentityProviderClient, SignUpCommand, InitiateAuthCommand, RespondToAuthChallengeCommand, AdminConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import User from "../models/User.js"; 
import dbConnect from '../lib/dbConnect.js';

// Initialize the client
const cognitoClient = new CognitoIdentityProviderClient({ region: "ap-south-1" }); 

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
            console.error("CRITICAL SIGNUP ERROR:", err);
            return res.status(500).json({ msg: "Failed during sign-up", error: err.name });
        }
    }

    // --- Step 2: Admin-confirm the user (THE FIX IS HERE) ---
    try {
        const confirmParams = {
            UserPoolId: userPoolId,
            Username: phone,
        };
        await cognitoClient.send(new AdminConfirmSignUpCommand(confirmParams));
        console.log(`Admin-confirmed user: ${phone}`);
    } catch (err) {
        // CHECK: If the error is "User cannot be confirmed. Current status is CONFIRMED"
        // We ignore it and proceed to login.
        if (err.name === 'NotAuthorizedException' && err.message.includes('Current status is CONFIRMED')) {
             console.log(`User ${phone} is already confirmed. Proceeding to login...`);
        } else {
             // If it's any OTHER error (like permissions), we stop.
             console.error("CRITICAL ADMIN CONFIRM ERROR:", err);
             return res.status(500).json({ msg: "Failed during admin confirmation", error: err.name });
        }
    }

    // --- Step 3: Initiate the login flow ---
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