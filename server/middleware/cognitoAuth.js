import { CognitoJwtVerifier } from "aws-jwt-verify";

// Initialize the verifier outside the middleware function
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.COGNITO_APP_CLIENT_ID,
});

const cognitoAuth = async (req, res, next) => {
  const token = req.header('authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verify the token
    const payload = await verifier.verify(token);
    // Attach the user's Cognito ID (sub) and phone number to the request object
    req.user = { 
        id: payload.sub, // 'sub' is the unique user ID from Cognito
        phone: payload.phone_number 
    };
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

export default cognitoAuth;