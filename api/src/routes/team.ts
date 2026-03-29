import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest, authorize, checkUsageLimit } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// In-memory store
const teamMembers: Map<string, any[]> = new Map();
const invitations: Map<string, any[]> = new Map();

// Get team members
router.get('/members', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantMembers = teamMembers.get(req.user!.tenantId) || [];
    const sanitizedMembers = tenantMembers.map(({ password, ...member }) => member);
    res.json({ members: sanitizedMembers });
  } catch (error) {
    logger.error('Get team members error', { error });
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Invite team member
router.post('/invite',
  authenticate,
  authorize('owner', 'admin'),
  checkUsageLimit('teamMembers'),
  [
    body('email').isEmail().normalizeEmail(),
    body('role').isIn(['admin', 'member', 'viewer'])
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, role } = req.body;
      const tenantId = req.user!.tenantId;

      // Check if already a member
      const existingMembers = teamMembers.get(tenantId) || [];
      if (existingMembers.some(m => m.email === email)) {
        return res.status(409).json({ error: 'User is already a team member' });
      }

      // Check pending invitations
      const pendingInvites = invitations.get(tenantId) || [];
      if (pendingInvites.some(i => i.email === email && i.status === 'pending')) {
        return res.status(409).json({ error: 'Invitation already sent to this email' });
      }

      const invitation = {
        id: uuidv4(),
        tenantId,
        email,
        role,
        invitedBy: req.user!.id,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };

      pendingInvites.push(invitation);
      invitations.set(tenantId, pendingInvites);

      // In production, send invitation email
      logger.info('Team invitation sent', { email, tenantId });

      res.status(201).json({ 
        message: 'Invitation sent successfully',
        invitation: { id: invitation.id, email, role, expiresAt: invitation.expiresAt }
      });
    } catch (error) {
      logger.error('Invite team member error', { error });
      res.status(500).json({ error: 'Failed to send invitation' });
    }
  }
);

// Get pending invitations
router.get('/invitations', authenticate, authorize('owner', 'admin'), (req: AuthRequest, res: Response) => {
  try {
    const pendingInvites = invitations.get(req.user!.tenantId) || [];
    res.json({ invitations: pendingInvites.filter(i => i.status === 'pending') });
  } catch (error) {
    logger.error('Get invitations error', { error });
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Cancel invitation
router.delete('/invitations/:id', authenticate, authorize('owner', 'admin'), (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const pendingInvites = invitations.get(tenantId) || [];
    const index = pendingInvites.findIndex(i => i.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    pendingInvites.splice(index, 1);
    invitations.set(tenantId, pendingInvites);

    res.json({ message: 'Invitation cancelled' });
  } catch (error) {
    logger.error('Cancel invitation error', { error });
    res.status(500).json({ error: 'Failed to cancel invitation' });
  }
});

// Accept invitation (placeholder - requires authentication setup)
router.post('/invitations/:id/accept', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // In production, validate invitation and add user to team
    res.json({ message: 'Invitation accepted' });
  } catch (error) {
    logger.error('Accept invitation error', { error });
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Update team member role
router.patch('/members/:id/role',
  authenticate,
  authorize('owner'),
  [body('role').isIn(['admin', 'member', 'viewer'])],
  (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.user!.tenantId;
      const tenantMembers = teamMembers.get(tenantId) || [];
      const memberIndex = tenantMembers.findIndex(m => m.id === req.params.id);

      if (memberIndex === -1) {
        return res.status(404).json({ error: 'Member not found' });
      }

      // Can't change own role
      if (tenantMembers[memberIndex].id === req.user!.id) {
        return res.status(400).json({ error: 'Cannot change your own role' });
      }

      tenantMembers[memberIndex].role = req.body.role;
      teamMembers.set(tenantId, tenantMembers);

      logger.info('Team member role updated', { memberId: req.params.id, newRole: req.body.role, tenantId });

      res.json({ message: 'Role updated successfully' });
    } catch (error) {
      logger.error('Update role error', { error });
      res.status(500).json({ error: 'Failed to update role' });
    }
  }
);

// Remove team member
router.delete('/members/:id', authenticate, authorize('owner', 'admin'), (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const tenantMembers = teamMembers.get(tenantId) || [];
    const index = tenantMembers.findIndex(m => m.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Can't remove yourself
    if (tenantMembers[index].id === req.user!.id) {
      return res.status(400).json({ error: 'Cannot remove yourself from the team' });
    }

    tenantMembers.splice(index, 1);
    teamMembers.set(tenantId, tenantMembers);

    logger.info('Team member removed', { memberId: req.params.id, tenantId });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    logger.error('Remove member error', { error });
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Get team activity log
router.get('/activity', authenticate, (req: AuthRequest, res: Response) => {
  // In production, fetch from database
  const activities = [
    {
      id: uuidv4(),
      userId: req.user!.id,
      action: 'audit_created',
      details: { auditId: 'example' },
      timestamp: new Date().toISOString()
    }
  ];

  res.json({ activities });
});

export default router;
