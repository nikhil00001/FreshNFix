import { CognitoIdentityProviderClient, AdminListGroupsForUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import User from '../models/User.js';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

const admin = async (req, res, next) => {
  try {
    // req.user.id is the Cognito 'sub' ID from the cognitoAuth middleware
    const command = new AdminListGroupsForUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: req.user.id,
    });
    
    // --- 💡 START OF FIX ---
    // Use the new, correct command to get the user's groups
    const { Groups } = await cognitoClient.send(command);

    // Check if the 'Admins' group is present in the response
    const isAdminInCognito = Groups && Groups.some(group => group.GroupName === 'Admins');

    if (!isAdminInCognito) {
      return res.status(403).json({ msg: "Access denied. Not an admin." });
    }
    // --- 💡 END OF FIX ---
    
    // The second check against our local MongoDB remains the same.
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
