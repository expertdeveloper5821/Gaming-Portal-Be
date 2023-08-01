// authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { environmentConfig } from '../config/environmentConfig';

const verifyToken = (requiredRole: string) => (req: Request, res: Response, next: NextFunction) => {
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
    const decodedToken = jwt.verify(token, environmentConfig.JWT_SECRET) as { [key: string]: any };
    req.user = decodedToken;

    // Check if the user has the required role (e.g., 'admin', 'spectator' or 'user') to access the route
    if (!decodedToken.role[0] || decodedToken.role[0].role.indexOf(requiredRole) === -1) {
      // If the user does not have the required role, return 'Unauthorized' message
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
