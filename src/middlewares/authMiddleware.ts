import { Request, Response, NextFunction } from 'express';

const requireRole = (role: string) => (req: Request, res: Response, next: NextFunction) => {
  // Assuming that your User model has a 'role' property of type 'string'
  if (req.user && req.user.role === role) {
    // User has the required role, allow them to proceed
    next();
  } else {
    // User doesn't have the required role, respond with an error
    res.status(403).json({ message: 'Unauthorized' });
  }
};

export default requireRole;
