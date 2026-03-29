import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, query, validationResult } from 'express-validator';
import { authenticate, AuthRequest, checkUsageLimit } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// In-memory store (replace with database in production)
const audits: Map<string, any[]> = new Map();

// Get all audits for tenant
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantAudits = audits.get(req.user!.tenantId) || [];
    
    // Support filtering and pagination
    const { page = 1, limit = 20, status, scoreMin, scoreMax, search } = req.query;
    let filtered = [...tenantAudits];

    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }
    if (scoreMin) {
      filtered = filtered.filter(a => a.analysis.seoScore >= Number(scoreMin));
    }
    if (scoreMax) {
      filtered = filtered.filter(a => a.analysis.seoScore <= Number(scoreMax));
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filtered = filtered.filter(a => 
        a.business.name.toLowerCase().includes(searchLower) ||
        a.business.website?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Paginate
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = filtered.slice(startIndex, startIndex + Number(limit));

    res.json({
      audits: paginated,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filtered.length,
        pages: Math.ceil(filtered.length / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Get audits error', { error });
    res.status(500).json({ error: 'Failed to fetch audits' });
  }
});

// Get single audit
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantAudits = audits.get(req.user!.tenantId) || [];
    const audit = tenantAudits.find(a => a.id === req.params.id);

    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    res.json({ audit });
  } catch (error) {
    logger.error('Get audit error', { error });
    res.status(500).json({ error: 'Failed to fetch audit' });
  }
});

// Create new audit
router.post('/', 
  authenticate,
  checkUsageLimit('audits'),
  [
    body('business.name').notEmpty().trim(),
    body('business.category').notEmpty().trim(),
    body('business.location').notEmpty().trim(),
    body('business.website').optional().isURL()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const tenantId = req.user!.tenantId;
      const tenantAudits = audits.get(tenantId) || [];

      const newAudit = {
        id: uuidv4(),
        tenantId,
        userId: req.user!.id,
        timestamp: new Date().toISOString(),
        status: 'pending',
        business: req.body.business,
        analysis: null,
        metadata: {
          source: req.body.source || 'manual',
          priority: req.body.priority || 'normal'
        }
      };

      tenantAudits.push(newAudit);
      audits.set(tenantId, tenantAudits);

      // In production, trigger async processing
      // processAuditQueue.add(newAudit);

      logger.info('Audit created', { auditId: newAudit.id, tenantId });

      res.status(201).json({ audit: newAudit });
    } catch (error) {
      logger.error('Create audit error', { error });
      res.status(500).json({ error: 'Failed to create audit' });
    }
  }
);

// Bulk create audits
router.post('/bulk',
  authenticate,
  checkUsageLimit('audits'),
  [body('businesses').isArray({ min: 1, max: 100 })],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const tenantId = req.user!.tenantId;
      const tenantAudits = audits.get(tenantId) || [];
      const createdAudits = [];

      for (const business of req.body.businesses) {
        const newAudit = {
          id: uuidv4(),
          tenantId,
          userId: req.user!.id,
          timestamp: new Date().toISOString(),
          status: 'pending',
          business,
          analysis: null,
          metadata: { source: 'bulk' }
        };
        tenantAudits.push(newAudit);
        createdAudits.push(newAudit);
      }

      audits.set(tenantId, tenantAudits);

      logger.info('Bulk audits created', { count: createdAudits.length, tenantId });

      res.status(201).json({ 
        audits: createdAudits,
        message: `${createdAudits.length} audits queued for processing`
      });
    } catch (error) {
      logger.error('Bulk create audits error', { error });
      res.status(500).json({ error: 'Failed to create bulk audits' });
    }
  }
);

// Delete audit
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const tenantAudits = audits.get(tenantId) || [];
    const index = tenantAudits.findIndex(a => a.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    tenantAudits.splice(index, 1);
    audits.set(tenantId, tenantAudits);

    logger.info('Audit deleted', { auditId: req.params.id, tenantId });

    res.json({ message: 'Audit deleted successfully' });
  } catch (error) {
    logger.error('Delete audit error', { error });
    res.status(500).json({ error: 'Failed to delete audit' });
  }
});

// Export audits
router.get('/export/csv', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantAudits = audits.get(req.user!.tenantId) || [];
    
    const headers = ['Business', 'Category', 'Location', 'Website', 'SEO Score', 'GMB Optimized', 'Date', 'Status'];
    const rows = tenantAudits.map(a => [
      a.business.name,
      a.business.category,
      a.business.location,
      a.business.website || '',
      a.analysis?.seoScore || 'N/A',
      a.analysis?.gmbOptimized ? 'Yes' : 'No',
      new Date(a.timestamp).toLocaleDateString(),
      a.status
    ]);

    const csv = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audits-export.csv');
    res.send(csv);
  } catch (error) {
    logger.error('Export CSV error', { error });
    res.status(500).json({ error: 'Failed to export audits' });
  }
});

// Export audits JSON
router.get('/export/json', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantAudits = audits.get(req.user!.tenantId) || [];
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=audits-export.json');
    res.json(tenantAudits);
  } catch (error) {
    logger.error('Export JSON error', { error });
    res.status(500).json({ error: 'Failed to export audits' });
  }
});

// Get audit statistics
router.get('/stats/summary', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantAudits = audits.get(req.user!.tenantId) || [];
    
    const totalAudits = tenantAudits.length;
    const completedAudits = tenantAudits.filter(a => a.status === 'completed').length;
    const avgScore = tenantAudits.length > 0
      ? tenantAudits.reduce((sum, a) => sum + (a.analysis?.seoScore || 0), 0) / tenantAudits.length
      : 0;

    const scoreDistribution = {
      excellent: tenantAudits.filter(a => a.analysis?.seoScore >= 80).length,
      good: tenantAudits.filter(a => a.analysis?.seoScore >= 60 && a.analysis?.seoScore < 80).length,
      needsWork: tenantAudits.filter(a => a.analysis?.seoScore >= 40 && a.analysis?.seoScore < 60).length,
      poor: tenantAudits.filter(a => a.analysis?.seoScore < 40).length
    };

    const gmbOptimized = tenantAudits.filter(a => a.analysis?.gmbOptimized).length;

    res.json({
      totalAudits,
      completedAudits,
      pendingAudits: totalAudits - completedAudits,
      averageScore: Math.round(avgScore),
      scoreDistribution,
      gmbOptimized,
      gmbOptimizationRate: totalAudits > 0 ? Math.round((gmbOptimized / totalAudits) * 100) : 0
    });
  } catch (error) {
    logger.error('Get stats error', { error });
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
