import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, AuthRequest, checkPlan } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// In-memory store
const scheduledAudits: Map<string, any[]> = new Map();

// Get all scheduled audits
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantScheduled = scheduledAudits.get(req.user!.tenantId) || [];
    res.json({ scheduledAudits: tenantScheduled });
  } catch (error) {
    logger.error('Get scheduled audits error', { error });
    res.status(500).json({ error: 'Failed to fetch scheduled audits' });
  }
});

// Create scheduled audit
router.post('/', authenticate, checkPlan('pro', 'enterprise'), (req: AuthRequest, res: Response) => {
  try {
    const { 
      name,
      businesses,
      frequency = 'weekly',
      dayOfWeek = 1,
      time = '09:00',
      timezone = 'UTC',
      notifications = true
    } = req.body;

    if (!businesses || businesses.length === 0) {
      return res.status(400).json({ error: 'At least one business is required' });
    }

    const scheduled = {
      id: uuidv4(),
      tenantId: req.user!.tenantId,
      userId: req.user!.id,
      name: name || 'Scheduled Audit',
      businesses,
      frequency,
      schedule: { dayOfWeek, time, timezone },
      notifications,
      status: 'active',
      lastRun: null,
      nextRun: calculateNextRun(frequency, dayOfWeek, time),
      createdAt: new Date().toISOString()
    };

    const tenantScheduled = scheduledAudits.get(req.user!.tenantId) || [];
    tenantScheduled.push(scheduled);
    scheduledAudits.set(req.user!.tenantId, tenantScheduled);

    logger.info('Scheduled audit created', { scheduledId: scheduled.id, tenantId: req.user!.tenantId });

    res.status(201).json({ 
      message: 'Scheduled audit created',
      scheduled 
    });
  } catch (error) {
    logger.error('Create scheduled audit error', { error });
    res.status(500).json({ error: 'Failed to create scheduled audit' });
  }
});

// Get single scheduled audit
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantScheduled = scheduledAudits.get(req.user!.tenantId) || [];
    const scheduled = tenantScheduled.find(s => s.id === req.params.id);

    if (!scheduled) {
      return res.status(404).json({ error: 'Scheduled audit not found' });
    }

    res.json({ scheduled });
  } catch (error) {
    logger.error('Get scheduled audit error', { error });
    res.status(500).json({ error: 'Failed to fetch scheduled audit' });
  }
});

// Update scheduled audit
router.patch('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const tenantScheduled = scheduledAudits.get(tenantId) || [];
    const index = tenantScheduled.findIndex(s => s.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Scheduled audit not found' });
    }

    const allowedFields = ['name', 'businesses', 'frequency', 'dayOfWeek', 'time', 'timezone', 'notifications'];
    const updates = Object.keys(req.body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    tenantScheduled[index] = {
      ...tenantScheduled[index],
      ...updates,
      nextRun: calculateNextRun(
        updates.frequency || tenantScheduled[index].frequency,
        updates.dayOfWeek || tenantScheduled[index].schedule.dayOfWeek,
        updates.time || tenantScheduled[index].schedule.time
      ),
      updatedAt: new Date().toISOString()
    };

    scheduledAudits.set(tenantId, tenantScheduled);

    res.json({ scheduled: tenantScheduled[index] });
  } catch (error) {
    logger.error('Update scheduled audit error', { error });
    res.status(500).json({ error: 'Failed to update scheduled audit' });
  }
});

// Delete scheduled audit
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const tenantScheduled = scheduledAudits.get(tenantId) || [];
    const index = tenantScheduled.findIndex(s => s.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Scheduled audit not found' });
    }

    tenantScheduled.splice(index, 1);
    scheduledAudits.set(tenantId, tenantScheduled);

    logger.info('Scheduled audit deleted', { scheduledId: req.params.id, tenantId });

    res.json({ message: 'Scheduled audit deleted' });
  } catch (error) {
    logger.error('Delete scheduled audit error', { error });
    res.status(500).json({ error: 'Failed to delete scheduled audit' });
  }
});

// Toggle scheduled audit status
router.post('/:id/toggle', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const tenantScheduled = scheduledAudits.get(tenantId) || [];
    const index = tenantScheduled.findIndex(s => s.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Scheduled audit not found' });
    }

    tenantScheduled[index].status = tenantScheduled[index].status === 'active' ? 'paused' : 'active';
    scheduledAudits.set(tenantId, tenantScheduled);

    res.json({ 
      message: `Scheduled audit ${tenantScheduled[index].status}`,
      scheduled: tenantScheduled[index]
    });
  } catch (error) {
    logger.error('Toggle scheduled audit error', { error });
    res.status(500).json({ error: 'Failed to toggle scheduled audit' });
  }
});

// Get run history
router.get('/:id/history', authenticate, (req: AuthRequest, res: Response) => {
  try {
    // In production, fetch from database
    const history = [
      {
        id: uuidv4(),
        scheduledId: req.params.id,
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 300000).toISOString(),
        status: 'completed',
        auditsCreated: 3,
        results: { avgScore: 68 }
      }
    ];

    res.json({ history });
  } catch (error) {
    logger.error('Get run history error', { error });
    res.status(500).json({ error: 'Failed to fetch run history' });
  }
});

// Helper function
function calculateNextRun(frequency: string, dayOfWeek: number, time: string): string {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  if (frequency === 'daily') {
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  } else if (frequency === 'weekly') {
    const currentDay = next.getDay();
    const daysUntil = (dayOfWeek - currentDay + 7) % 7 || 7;
    next.setDate(next.getDate() + daysUntil);
    if (next <= now) {
      next.setDate(next.getDate() + 7);
    }
  } else if (frequency === 'monthly') {
    next.setDate(1);
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  }

  return next.toISOString();
}

export default router;
