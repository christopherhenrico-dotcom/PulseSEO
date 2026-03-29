import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, AuthRequest, checkPlan } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// In-memory store
const reports: Map<string, any[]> = new Map();
const scheduledReports: Map<string, any[]> = new Map();

// Get all reports
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantReports = reports.get(req.user!.tenantId) || [];
    res.json({ reports: tenantReports });
  } catch (error) {
    logger.error('Get reports error', { error });
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get single report
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantReports = reports.get(req.user!.tenantId) || [];
    const report = tenantReports.find(r => r.id === req.params.id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report });
  } catch (error) {
    logger.error('Get report error', { error });
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Generate report
router.post('/generate', authenticate, checkPlan('pro', 'enterprise'), async (req: AuthRequest, res: Response) => {
  try {
    const { auditIds, format = 'pdf', title, includeCharts = true, includeRecommendations = true } = req.body;

    const newReport = {
      id: uuidv4(),
      tenantId: req.user!.tenantId,
      userId: req.user!.id,
      title: title || 'SEO Audit Report',
      format,
      status: 'generating',
      auditIds: auditIds || [],
      options: { includeCharts, includeRecommendations },
      createdAt: new Date().toISOString(),
      downloadUrl: null
    };

    const tenantReports = reports.get(req.user!.tenantId) || [];
    tenantReports.push(newReport);
    reports.set(req.user!.tenantId, tenantReports);

    // In production, queue report generation
    // reportQueue.add(newReport);

    logger.info('Report generation started', { reportId: newReport.id, tenantId: req.user!.tenantId });

    res.status(202).json({ 
      message: 'Report generation started',
      report: newReport 
    });
  } catch (error) {
    logger.error('Generate report error', { error });
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Download report
router.get('/:id/download', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantReports = reports.get(req.user!.tenantId) || [];
    const report = tenantReports.find(r => r.id === req.params.id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.status !== 'completed') {
      return res.status(400).json({ error: 'Report is not ready yet' });
    }

    // In production, stream the actual file
    res.json({ 
      message: 'Report ready for download',
      downloadUrl: report.downloadUrl 
    });
  } catch (error) {
    logger.error('Download report error', { error });
    res.status(500).json({ error: 'Failed to download report' });
  }
});

// Schedule recurring report
router.post('/schedule', authenticate, checkPlan('pro', 'enterprise'), async (req: AuthRequest, res: Response) => {
  try {
    const { 
      title, 
      frequency = 'weekly', 
      recipients, 
      format = 'pdf',
      includeAudits = 'all',
      options = {} 
    } = req.body;

    const scheduledReport = {
      id: uuidv4(),
      tenantId: req.user!.tenantId,
      userId: req.user!.id,
      title,
      frequency,
      recipients: recipients || [req.user!.email],
      format,
      includeAudits,
      options,
      status: 'active',
      nextRun: getNextRunDate(frequency),
      lastRun: null,
      createdAt: new Date().toISOString()
    };

    const tenantScheduled = scheduledReports.get(req.user!.tenantId) || [];
    tenantScheduled.push(scheduledReport);
    scheduledReports.set(req.user!.tenantId, tenantScheduled);

    logger.info('Scheduled report created', { scheduledReportId: scheduledReport.id, frequency, tenantId: req.user!.tenantId });

    res.status(201).json({ 
      message: 'Scheduled report created',
      scheduledReport 
    });
  } catch (error) {
    logger.error('Schedule report error', { error });
    res.status(500).json({ error: 'Failed to schedule report' });
  }
});

// Get scheduled reports
router.get('/scheduled/list', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantScheduled = scheduledReports.get(req.user!.tenantId) || [];
    res.json({ scheduledReports: tenantScheduled });
  } catch (error) {
    logger.error('Get scheduled reports error', { error });
    res.status(500).json({ error: 'Failed to fetch scheduled reports' });
  }
});

// Update scheduled report
router.patch('/scheduled/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const tenantScheduled = scheduledReports.get(tenantId) || [];
    const index = tenantScheduled.findIndex(r => r.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Scheduled report not found' });
    }

    const allowedFields = ['title', 'frequency', 'recipients', 'format', 'options'];
    const updates = Object.keys(req.body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    tenantScheduled[index] = {
      ...tenantScheduled[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    scheduledReports.set(tenantId, tenantScheduled);

    res.json({ scheduledReport: tenantScheduled[index] });
  } catch (error) {
    logger.error('Update scheduled report error', { error });
    res.status(500).json({ error: 'Failed to update scheduled report' });
  }
});

// Delete scheduled report
router.delete('/scheduled/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const tenantScheduled = scheduledReports.get(tenantId) || [];
    const index = tenantScheduled.findIndex(r => r.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Scheduled report not found' });
    }

    tenantScheduled.splice(index, 1);
    scheduledReports.set(tenantId, tenantScheduled);

    res.json({ message: 'Scheduled report deleted' });
  } catch (error) {
    logger.error('Delete scheduled report error', { error });
    res.status(500).json({ error: 'Failed to delete scheduled report' });
  }
});

// Helper function
function getNextRunDate(frequency: string): string {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    case 'monthly':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }
}

export default router;
