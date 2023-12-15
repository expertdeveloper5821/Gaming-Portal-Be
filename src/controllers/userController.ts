import { user as User } from "../models/passportModels";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { transporter } from "../middlewares/email";
import { v4 as uuidv4 } from "uuid";
import { passwordRegex, emailValidate } from "../utils/helper";
import { environmentConfig } from "../config/environmentConfig";
import { Role } from "../models/roleModel";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Team } from "../models/teamModel";
import { userType } from '../middlewares/authMiddleware';
import { io } from "../server";


// Configuration
cloudinary.config({
  cloud_name: environmentConfig.CLOUD_NAME,
  api_key: environmentConfig.API_KEY,
  api_secret: environmentConfig.API_SECRET
});

const jwtSecret: string = environmentConfig.JWT_SECRET;
const clickHere: string = environmentConfig.LOGIN_PAGE;

// for user signup
export const userSignup = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body;
    const { invitationToken } = req.query;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Email validation check using regex pattern
    if (!emailValidate(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Password validation check
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least one Upper letter, one digit, one special character (!@#$%^&*()_+)",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: `User with email ${email} already exists`,
      });
    }

    const defaultRole = await Role.findOne({ role: "user" });

    // Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (invitationToken && typeof invitationToken === 'string') {
      // Handle registration with an invitation token
      let decodedToken;
      try {
        decodedToken = jwt.verify(invitationToken, jwtSecret) as {
          userId: string;
          teamName: string;
        };
      } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({
          message: "Invalid token",
        });
      }

      const invitedUserId = decodedToken.userId;

      const newUuid = uuidv4();
      const newUser = new User({
        fullName,
        email,
        password: hashedPassword,
        role: defaultRole, // Assign the role
        userUuid: newUuid,
      });

      await newUser.save();

      const invitedUserTeam = await Team.findOne({ leadPlayerId: invitedUserId });

      if (invitedUserTeam) {
        invitedUserTeam.teamMates.push(newUser._id.toString());
        await invitedUserTeam.save();
      }

      // Send the registration email
      const mailOptions = {
        from: environmentConfig.EMAIL_USER,
        to: email,
        subject: "Registration Successful",
        html: `Thank you for registering on pattseheadshot.com!<br><br>
              Your login credentials:<br>
              Email: ${email}<br>
              Password: ${password}<br><br>
              <a href="${clickHere}">Click here</a> to log in.<br><br>
              Please do not share your credentials with anyone.`,
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.error("Failed to send registration email:", err);
        }
      });


      return res.status(200).json({
        message: "Registered successfully",
        userUuid: newUuid,
        success: true,
      });
    } else {
      // Handle registration without an invitation token
      const newUuid = uuidv4();
      const newUser = new User({
        fullName,
        email,
        password: hashedPassword,
        role: defaultRole, // Assign the role
        userUuid: newUuid,
      });

      await newUser.save();

      // Send the registration email
      const mailOptions = {
        from: environmentConfig.EMAIL_USER,
        to: email,
        subject: "Registration Successful",
        html: `Thank you for registering on pattseheadshot.com!<br><br>
              Your login credentials:<br>
              Email: ${email}<br>
              Password: ${password}<br><br>
              <a href="${clickHere}">Click here</a> to log in.<br><br>
              Please do not share your credentials with anyone.`,
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.error("Failed to send registration email:", err);
        }
      });

      return res.status(200).json({
        message: "Registered successfully",
        userUuid: newUuid,
        success: true,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// for user login
export const userLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("role", "role");

    if (user && user.isBlocked) {
      const blockDescription = user.description;
      return res.status(403).json({ message: 'Unabel to login.', blockDescription });
    }

    if (!user) {
      return res.status(400).json({
        message: `Invalid Email address or Password`,
      });
    }
    if (!user.password) {
      return res.status(400).json({
        message: `Password not found for this user`,
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(403)
        .json({ message: "Invalid Email address or Password" });
    }

    // Update the user's online status to true
    await User.findOneAndUpdate({ _id: user._id }, { isOnline: true });

    // Emit a user status update event
    io.emit('user-status-update', { userId: user._id, isOnline: true });

    // Retrieve user's team where the user is the lead player
    const team = await Team.findOne({ leadPlayerId: user._id });

    // Extract team name if the team exists
    const teamName = team ? team.teamName : null;

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        userUuid: user.userUuid,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        upiId: user.upiId,
        userName: user.userName,
        profilePic: user.profilePic,
        teamName: teamName
      },
      environmentConfig.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    let userData = {
      token: token,
    };

    return res.status(200).json({
      message: "user Login successfully",
      userData,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};


// to forget password
export const forgetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    // Check if email exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: `Account with email ${email} not found`,
      });
    }

    // Generate a unique reset token
    const resetToken = uuidv4();

    // Create the JWT
    const expiresIn = "1h";
    const token = jwt.sign({ email, resetToken }, jwtSecret as string, {
      expiresIn,
    });

    // Construct the reset password URL
    const resetPasswordUrl = `${environmentConfig.RESET_PASSWORD}?token=${token}`;

    // Send the reset password URL in the email
    const mailOptions = {
      from: environmentConfig.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      html: `Click on the following link to reset your password <a href=${resetPasswordUrl}>Click Here</a>`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        res.status(500).json({
          message: "Failed to send the reset password URL",
        });
      } else {
        res.json({
          token: token,
          message:
            "Reset password URL sent successfully please check your email",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// to reset password
export const resetPassword = async (req: Request, res: Response) => {
  const { newPassword, confirmPassword } = req.body;
  try {
    const token = req.query.token;
    // Verify the token
    const decodedToken = jwt.verify(token as string, jwtSecret as Secret);
    const { email } = decodedToken as JwtPayload;

    // Check if email exists in the database
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }
    // Add validation: Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Passwords must be same" });
    }
    if (!passwordRegex.test(confirmPassword)) {
      return res.status(400).json({
        message:
          "Password must contain at least one letter, one digit, one special character (!@#$%^&*()_+), and be at least 6 characters long",
      });
    }
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(confirmPassword, saltRounds);

    // Update the user's password
    existingUser.password = hashedPassword;
    await existingUser.save();

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Invalid or expired token" });
  }
};


// get user by ID
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    // Define req.user before accessing its properties
    const user = req.user as userType; // Type assertion to userType

    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }

    const userId = user.userId;

    // Use the findById method to find the user by their ID in the database
    const foundUser = await User.findById(userId).populate('role', 'role');

    if (!foundUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // If the user is found, construct the response object
    const responseData = {
      userUuid: foundUser.userUuid,
      fullName: foundUser.fullName,
      userName: foundUser.userName,
      email: foundUser.email,
      role: foundUser.role,
      upiId: foundUser.upiId,
      phoneNumber: foundUser.phoneNumber,
      profilePic: foundUser.profilePic
    };

    // Return the user data as the response
    return res.status(200).json({
      data: responseData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// get all user
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search, sort, page, limit } = req.query;

    let usersQuery = {};

    if (search) {
      usersQuery = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { userName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { upiId: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } },
        ],
      };
    }

    // Handle sorting by _id (latest or oldest)
    let sortOptions = {};
    if (sort === 'latestfirst' || sort === 'oldestfirst') {
      sortOptions = { _id: sort === 'latestfirst' ? -1 : 1 };
    }
    // Handle pagination
    const parsedPage = parseInt(page as string, 10) || 1;
    const parsedLimit = parseInt(limit as string, 10) || 10;
    const skip = (parsedPage - 1) * parsedLimit;

    const allUsers = await User
      .find(usersQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(parsedLimit)
      .populate('role', 'role');

    if (allUsers.length === 0) {
      return res.status(404).json({
        message: search ? "No users found with the provided query" : "No users found",
      });
    }

    return res.status(200).json({
      data: allUsers.map((data) => {
        return {
          userUuid: data?.userUuid,
          fullName: data?.fullName,
          userName: data?.userName,
          email: data?.email,
          upiId: data?.upiId,
          phoneNumber: data?.phoneNumber,
          profilePic: data?.profilePic,
          role: data?.role,
        };
      }),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// update user by id
export const userUpdate = async (req: Request, res: Response) => {
  try {
    // Define req.user before accessing its properties
    const user = req.user as userType; // Type assertion to userType

    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }

    const userId = user.userId;

    const updatedUserData = req.body;

    const file = req.file;
    const tempPath = file?.path;

    let secure_url: string | null = null;
    if (tempPath) {
      const uploadResponse: UploadApiResponse = await cloudinary.uploader.upload(
        tempPath
      );
      secure_url = uploadResponse.secure_url;
    }

    if (secure_url) {
      updatedUserData.profilePic = secure_url; // Update profilePic field in updatedUserData
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
    }).populate("role", "role");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!updatedUser._id) {
      console.log("Error updating user:", updatedUser);
      return res.status(500).json({ error: "Error updating user" });
    }

    // extracting user info
    const { fullName, userName, email, role, userUuid, upiId, phoneNumber, profilePic } = updatedUser
    // Create a new token with updated user data
    const token = jwt.sign({ userId: updatedUser._id, role: updatedUser.role, fullName, userName, email, userUuid, upiId, phoneNumber, profilePic }, environmentConfig.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Return the updated user data as the response
    return res.status(200).json({
      token: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// delete by id
export const userDelete = async (req: Request, res: Response) => {
  try {
    // Define req.user before accessing its properties
    const user = req.user as userType; // Type assertion to userType

    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }

    const userId = user.userId;

    // Use the deleteOne method to delete the user by their ID from the database
    const deletionResult = await User.deleteOne({ _id: userId });

    if (deletionResult.deletedCount === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // If the user is deleted successfully, return the deletion result as the response
    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// send invite mail to teammates
export const sendInviteMail = async (req: Request, res: Response) => {
  try {
    const { teamName, emails } = req.body;

    // Define req.user before accessing its properties
    const user = req.user as userType; // Type assertion to userType

    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }

    const userId = user.userId;
    let team: any;

    // Check if the user sending the invitations already has a team
    const userTeam = await Team.findOne({ leadPlayerId: userId });

    if (!userTeam) {
      // If the user doesn't have a team, create one and save the team name
      // Check if the team name already exists in the Team table
      const existingTeam = await Team.findOne({ teamName });

      if (existingTeam) {
        return res.status(400).json({ error: "Team name already exists" });
      }

      // Save the teamName in the Team table
      team = new Team({ teamName });
      await team.save();

      // Add the user's _id to the leadPlayerId array in the Team table
      await Team.updateOne({ _id: team._id }, { $addToSet: { leadPlayerId: userId } });
    }

    // Configure the registration URL (replace with your actual registration URL)
    const registrationUrl = environmentConfig.CLIENT_URL;

    const sentInvitations: string[] = [];

    // Send invitation emails to the provided email addresses
    for (const email of emails) {
      const invitationToken = jwt.sign(
        { teamId: userTeam ? userTeam._id : team._id, teamName, userId },
        jwtSecret,
        { expiresIn: '1h' } // Set an expiration time for the token
      );

      const invitationLink = `${registrationUrl}?invitationToken=${invitationToken}`;

      await transporter.sendMail({
        from: 'your-email@example.com',
        to: email,
        subject: 'Invitation to Join the Team',
        html: `You have been invited to join the team ${teamName}. Click <a href="${invitationLink}">here</a> to register and join the team.`,
      });

      sentInvitations.push(email);
    }


    let message = '';

    if (sentInvitations.length > 0) {
      message += `Invitations sent to: ${sentInvitations.join(', ')}. `;
    }

    const socketIo = req.app.locals.io;
    socketIo.emit('invitation-sent', { teamId: userTeam ? userTeam._id : team._id });

    if (message === '') {
      message = 'No invitations sent.';
    }

    return res.status(200).json({ message: message, teamId: userTeam ? userTeam._id : team._id, });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// accept invitaion to join the team
export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    // Define req.user before accessing its properties
    const user = req.user as userType; // Type assertion to userType

    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }

    const userId = user.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Invalid authentication token', success: false });
    }

    const { invitationToken } = req.query as { invitationToken: string };

    if (!invitationToken) {
      return res.status(400).json({ message: 'Invitation token is missing', success: false });
    }

    // Verify the invitation token
    const decodedInvitationToken = jwt.verify(invitationToken, jwtSecret);
    if (
      typeof decodedInvitationToken !== 'object' ||
      !('teamId' in decodedInvitationToken) ||
      !('teamName' in decodedInvitationToken) ||
      !('userId' in decodedInvitationToken)
    ) {
      return res.status(401).json({ message: 'Invalid invitation token', success: false });
    }

    // Retrieve the user's information from the invitation token
    const { teamId } = decodedInvitationToken as {
      teamId: string;
      teamName: string;
      userId: string;
    };

    // Add the user to the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found', success: false });
    }

    // Check if the user is already part of the team
    if (team.teamMates.includes(userId)) {
      return res.status(400).json({ message: 'User is already part of the team', success: false });
    }

    // Add the user to the team
    team.teamMates.push(userId);
    await team.save();

    // Emit a WebSocket event to notify the sender
    const socketIo = req.app.locals.io;
    socketIo.emit('invitation-accepted', { teamId: team._id, userId });

    return res.status(200).json({ message: 'Invitation accepted successfully', success: true });

  } catch (error) {
    console.error('Error:', error);

    // Provide a more detailed error message
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token', success: false });
    } else {
      return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
  }
};


// sending manual match info to users email
export const sendEmailToUser = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, 'email');

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found in the database.' });
    }

    const commonMailOptions = {
      from: environmentConfig.EMAIL_USER,
      subject: 'PattseHeadshot Newsletter: Join Us for a BGMI Match Today',
    };

    for (const currentUser of users) {
      const mailOptions = {
        ...commonMailOptions,
        to: currentUser.email,
        html: ` <p>Room ID : 4368418 </p><br/>
        <p>Password : No Password </p><br/>
        <p>Time : 7:00 PM </p><br/>
        <p>Date : 15-09-2023 </p><br/>
        <p>Map : Miramar </p><br/>
        <p>Tpye : Squad </p><br/>` ,
      };

      await transporter.sendMail(mailOptions);
    }

    // Send the success response after all emails have been sent
    return res.status(200).json({ message: 'Email sent to all users successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}


// export const findEmail = async (req: Request,res:Response) => {
//   try {
//     const emails = await User.find({}, 'email')
//     if (!emails || emails.length === 0) {
//       return res.status(404).json({message: 'user email not found'})
//     }
//     const emailFound = emails.map((user) => user.email)
//       return res.status(200).json({message: 'Successfully get user emal', emailFound})
//   } catch (error) {
//     return res.status(500).json({message: 'internal server erroe'})
//   }
// }

// for spectator to change the password after login
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    const user = req.user as userType;

    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }

    const userId = user.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Invalid authentication token', success: false });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    if (!passwordRegex.test(confirmPassword)) {
      return res.status(400).json({
        message:
          "Password must contain at least one letter, one digit, one special character (!@#$%^&*()_+), and be at least 6 characters long",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

