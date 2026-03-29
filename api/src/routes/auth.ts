import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// In-memory store (replace with database in production)
const users: Map<string, any> = new Map();
const refreshTokens: Map<string, string> = new Map();

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().isLength({ min: 2 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, company } = req.body;

    // Check if user exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create tenant
    const tenantId = uuidv4();
    const userId = uuidv4();

    const user = {
      id: userId,
      tenantId,
      email,
      password: hashedPassword,
      name,
      company: company || '',
      role: 'owner',
      plan: 'free',
      createdAt: new Date().toISOString(),
      emailVerified: false,
      twoFactorEnabled: false
    };

    users.set(userId, user);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.set(refreshToken, userId);

    logger.info('User registered', { userId, tenantId });

    res.status(201).json({
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    });
  } catch (error) {
    logger.error('Registration error', { error });
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.set(refreshToken, user.id);

    logger.info('User logged in', { userId: user.id });

    res.json({
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    });
  } catch (error) {
    logger.error('Login error', { error });
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || !refreshTokens.has(refreshToken)) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const userId = refreshTokens.get(refreshToken);
    const user = users.get(userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Rotate refresh token
    refreshTokens.delete(refreshToken);
    const newRefreshToken = generateRefreshToken(user);
    refreshTokens.set(newRefreshToken, user.id);

    const accessToken = generateAccessToken(user);

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    logger.error('Token refresh error', { error });
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Logout
router.post('/logout', authenticate, (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    refreshTokens.delete(refreshToken);
  }
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = users.get(req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user: sanitizeUser(user) });
});

// Update profile
router.patch('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = users.get(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const allowedFields = ['name', 'company'];
    const updates = Object.keys(req.body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    Object.assign(user, updates);
    users.set(user.id, user);

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    logger.error('Profile update error', { error });
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// Change password
router.post('/change-password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = users.get(req.user?.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    users.set(user.id, user);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Password change error', { error });
    res.status(500).json({ error: 'Password change failed' });
  }
});

// Forgot password
router.post('/forgot-password', [body('email').isEmail().normalizeEmail()], async (req: Request, res: Response) => {
  // In production, send password reset email
  res.json({ message: 'If an account exists, a reset email has been sent' });
});

// Reset password
router.post('/reset-password', async (req: Request, res: Response) => {
  // In production, validate reset token and update password
  res.json({ message: 'Password reset successful' });
});

// Helper functions
function generateAccessToken(user: any): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      plan: user.plan
    },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user: any): string {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user: any) {
  const { password, ...sanitized } = user;
  return sanitized;
}

export default router;
