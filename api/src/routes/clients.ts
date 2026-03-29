import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest, checkUsageLimit } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// In-memory store
const clients: Map<string, any[]> = new Map();

// Get all clients
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantClients = clients.get(req.user!.tenantId) || [];
    const { search } = req.query;

    let filtered = [...tenantClients];
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.company?.toLowerCase().includes(searchLower)
      );
    }

    res.json({ clients: filtered });
  } catch (error) {
    logger.error('Get clients error', { error });
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get single client
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantClients = clients.get(req.user!.tenantId) || [];
    const client = tenantClients.find(c => c.id === req.params.id);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ client });
  } catch (error) {
    logger.error('Get client error', { error });
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// Create client
router.post('/',
  authenticate,
  checkUsageLimit('clients'),
  [
    body('name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('phone').optional().trim(),
    body('company').optional().trim(),
    body('notes').optional().trim()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const tenantId = req.user!.tenantId;
      const tenantClients = clients.get(tenantId) || [];

      const newClient = {
        id: uuidv4(),
        tenantId,
        ...req.body,
        totalAudits: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      tenantClients.push(newClient);
      clients.set(tenantId, tenantClients);

      logger.info('Client created', { clientId: newClient.id, tenantId });

      res.status(201).json({ client: newClient });
    } catch (error) {
      logger.error('Create client error', { error });
      res.status(500).json({ error: 'Failed to create client' });
    }
  }
);

// Update client
router.patch('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const tenantClients = clients.get(tenantId) || [];
    const clientIndex = tenantClients.findIndex(c => c.id === req.params.id);

    if (clientIndex === -1) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const allowedFields = ['name', 'email', 'phone', 'company', 'notes'];
    const updates = Object.keys(req.body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    tenantClients[clientIndex] = {
      ...tenantClients[clientIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    clients.set(tenantId, tenantClients);

    logger.info('Client updated', { clientId: req.params.id, tenantId });

    res.json({ client: tenantClients[clientIndex] });
  } catch (error) {
    logger.error('Update client error', { error });
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const tenantClients = clients.get(tenantId) || [];
    const index = tenantClients.findIndex(c => c.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Client not found' });
    }

    tenantClients.splice(index, 1);
    clients.set(tenantId, tenantClients);

    logger.info('Client deleted', { clientId: req.params.id, tenantId });

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    logger.error('Delete client error', { error });
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;
