import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { environmentConfig } from '../config/environmentConfig';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
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
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'You are not authenticated!',
      success: false,
    });
  }
};
