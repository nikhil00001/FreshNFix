import { CognitoIdentityProviderClient, AdminListGroupsForUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import User from '../models/User.js'; // Your MongoDB User model

const cognitoClient = new CognitoIdentityProviderClient({ region: "ap-south-1" });

const admin = async (req, res, next) => {
  try {
    // 1. Use the CORRECT command to get the user's groups
    const groupData = await cognitoClient.send(new AdminListGroupsForUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: req.user.id, // This is the user's 'sub' ID from the token
    }));

    // 2. Check the 'Groups' array in the response
    const isAdminInCognito = groupData.Groups && groupData.Groups.some(group => group.GroupName === 'Admins');

    if (!isAdminInCognito) {
      return res.status(403).json({ msg: "Access denied. Not an admin." });
    }
    
    // 3. Your local database check remains the same
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