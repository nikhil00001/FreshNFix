import { CognitoIdentityProviderClient, SignUpCommand, InitiateAuthCommand, RespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider";
import User from "../models/User.js"; // Your MongoDB User model

const cognitoClient = new CognitoIdentityProviderClient({ region: "ap-south-1" }); // e.g., "ap-south-1"

// --- Step 1: Initiate Sign-Up / Sign-In with Phone ---
// This will either start the sign-up process or the login process if the user exists.
// Cognito handles sending the OTP via SNS.
const startAuth = async (req, res) => {
    const { phone } = req.body;
    const clientId = process.env.COGNITO_APP_CLIENT_ID;

    try {
        // We first try to sign up the user. If they already exist, Cognito will throw an error
        // which we catch and then proceed with the login flow.
        const signUpParams = {
            ClientId: clientId,
            Username: phone,
            Password: `aB1!${Date.now()}`, // A dummy password, as we use OTP
            UserAttributes: [{ Name: "phone_number", Value: phone }],
        };
        await cognitoClient.send(new SignUpCommand(signUpParams));
    } catch (err) {
        if (err.name !== "UsernameExistsException") {
            console.error("Cognito SignUp Error:", err);
            return res.status(500).json({ msg: "Authentication failed" });
        }
        // If user exists, we continue to the login flow below.
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
        console.error("Cognito InitiateAuth Error:", err);
        res.status(500).json({ msg: "Failed to send OTP." });
    }
};


// --- Step 2: Verify the OTP and Get Tokens (Corrected) ---
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
        const response = await cognitoClient.send(new RespondToAuthChallengeCommand(params));
        
        // --- 💡 START OF FIX ---
        // The IdToken is an encoded string. We need to decode it.
        const idToken = response.AuthenticationResult.IdToken;
        
        // The middle part of the token is the payload, which is Base64 encoded.
        const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
        
        // Now we can safely get the user's unique ID ('sub').
        const cognitoUserId = payload.sub;
        const accessToken = response.AuthenticationResult.AccessToken;
        // --- 💡 END OF FIX ---

        // Check if user exists in our MongoDB, if not, create them
        let user = await User.findOne({ phone: phone });
        if (!user) {
            // We can also add the Cognito ID to our local user for future reference
            user = new User({ phone: phone, cognitoId: cognitoUserId }); 
            await user.save();
        }

        res.json({ token: accessToken }); // Send the Cognito Access Token to the client
    } catch (err) {
        console.error("Cognito VerifyOTP Error:", err);
        res.status(400).json({ msg: "Invalid or expired OTP." });
    }
};

export { startAuth, verifyOtp };