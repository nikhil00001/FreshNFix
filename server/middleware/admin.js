import { CognitoIdentityProviderClient, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import User from '../models/User.js'; // Your MongoDB User model

const cognitoClient = new CognitoIdentityProviderClient({ region: "us-east-1" });

const admin = async (req, res, next) => {
  try {
    // req.user.id is the Cognito 'sub' ID from the cognitoAuth middleware
    const cognitoUser = await cognitoClient.send(new AdminGetUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: req.user.id,
    }));

    const groups = cognitoUser.UserAttributes.find(attr => attr.Name === 'cognito:groups');
    
    if (!groups || !groups.Value.includes('Admins')) {
      return res.status(403).json({ msg: "Access denied. Not an admin." });
    }
    
    // Additionally, ensure the user exists in your local DB and has the admin role
    const localUser = await User.findOne({ phone: req.user.phone });
    if (!localUser || localUser.role !== 'admin') {
         return res.status(403).json({ msg: "Access denied. Local user not configured as admin." });
    }

    next();
  } catch (err) {
    console.error("Admin check error:", err);
    res.status(500).send('Server error');
  }
};

export default admin;