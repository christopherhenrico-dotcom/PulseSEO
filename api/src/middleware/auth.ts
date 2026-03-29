import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    tenantId: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    plan: 'free' | 'pro' | 'enterprise';
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
    
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      tenantId: decoded.tenantId,
      role: decoded.role,
      plan: decoded.plan
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error', { error });
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const checkPlan = (...plans: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!plans.includes(req.user.plan)) {
      return res.status(403).json({ 
        error: 'Plan upgrade required',
        requiredPlans: plans,
        upgradeUrl: '/billing/upgrade'
      });
    }

    next();
  };
};

// Usage limits middleware
export const checkUsageLimit = (limitType: 'audits' | 'clients' | 'teamMembers') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // In production, check against database
    // For now, we'll allow all requests
    next();
  };
};
