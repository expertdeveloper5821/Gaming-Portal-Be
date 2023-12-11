import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { environmentConfig } from '../config/environmentConfig';

// Define the User interface
export interface userType {
  userId: string;
  fullName: string;
  role: {
    role: string[]; // Define the structure of the 'role' property
  };
}

const verifyToken = (allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Authorization header not found',
      success: false,
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'You are not authenticated!',
      success: false,
    });
  }

  try {
    const decodedToken = jwt.verify(token, environmentConfig.JWT_SECRET);

    if (typeof decodedToken !== 'object' || decodedToken === null) {
      return res.status(401).json({
        message: 'Invalid token!',
        success: false,
      });
    }

    req.user = decodedToken as userType; //'userType' is in interface

    // Check if the user has the required role to access the route
    const hasAllowedRole = allowedRoles.some(role => decodedToken.role && decodedToken.role.role.indexOf(role) !== -1);

    if (!hasAllowedRole) {
      return res.status(401).json({ message: 'Unauthorized.', success: false });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'You are not authenticated!',
      success: false,
    });
  }
};

export { verifyToken };