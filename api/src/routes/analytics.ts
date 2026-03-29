import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Get dashboard analytics
router.get('/dashboard', authenticate, (req: AuthRequest, res: Response) => {
  try {
    // In production, aggregate from database
    const analytics = {
      overview: {
        totalAudits: 156,
        totalClients: 12,
        averageScore: 68,
        auditsThisMonth: 42,
        auditsGrowth: 15.5,
        clientsGrowth: 8.3
      },
      scoreDistribution: [
        { range: '90-100', count: 12, percentage: 7.7 },
        { range: '80-89', count: 28, percentage: 17.9 },
        { range: '70-79', count: 45, percentage: 28.8 },
        { range: '60-69', count: 38, percentage: 24.4 },
        { range: '50-59', count: 22, percentage: 14.1 },
        { range: '0-49', count: 11, percentage: 7.1 }
      ],
      recentActivity: [
        { type: 'audit', description: 'New audit completed for Joe\'s Pizza', timestamp: new Date().toISOString(), score: 72 },
        { type: 'client', description: 'New client added: Smith Consulting', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { type: 'report', description: 'Weekly report generated', timestamp: new Date(Date.now() - 86400000).toISOString() }
      ],
      topPerformers: [
        { business: 'Coffee Corner', score: 92, change: 5 },
        { business: 'Tech Solutions Inc', score: 88, change: -2 },
        { business: 'Green Valley Restaurant', score: 85, change: 8 }
      ],
      needsAttention: [
        { business: 'Budget Electronics', score: 35, issues: ['Missing meta descriptions', 'No mobile optimization', 'Slow page speed'] },
        { business: 'Quick Fix Auto', score: 42, issues: ['Duplicate content', 'Missing alt tags'] }
      ]
    };

    res.json({ analytics });
  } catch (error) {
    logger.error('Get dashboard analytics error', { error });
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get trends
router.get('/trends', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { period = '30d' } = req.query;

    // In production, query database
    const trends = {
      period,
      data: generateTrendData(period as string)
    };

    res.json({ trends });
  } catch (error) {
    logger.error('Get trends error', { error });
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// Get comparison data
router.get('/compare/:id1/:id2', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { id1, id2 } = req.params;

    // In production, fetch both audits and compare
    const comparison = {
      audit1: {
        id: id1,
        business: 'Business A',
        seoScore: 72,
        gmbOptimized: true
      },
      audit2: {
        id: id2,
        business: 'Business B',
        seoScore: 65,
        gmbOptimized: false
      },
      differences: {
        scoreDiff: 7,
        strengths: ['Better meta descriptions', 'Optimized images'],
        weaknesses: ['Slower page speed', 'Missing schema markup']
      }
    };

    res.json({ comparison });
  } catch (error) {
    logger.error('Get comparison error', { error });
    res.status(500).json({ error: 'Failed to fetch comparison' });
  }
});

// Get category breakdown
router.get('/categories', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const categories = [
      { name: 'Restaurants', auditCount: 45, avgScore: 62, trend: 3.2 },
      { name: 'Retail', auditCount: 32, avgScore: 68, trend: -1.5 },
      { name: 'Professional Services', auditCount: 28, avgScore: 71, trend: 5.8 },
      { name: 'Healthcare', auditCount: 18, avgScore: 65, trend: 2.1 },
      { name: 'Automotive', auditCount: 15, avgScore: 58, trend: -0.8 },
      { name: 'Other', auditCount: 18, avgScore: 64, trend: 1.2 }
    ];

    res.json({ categories });
  } catch (error) {
    logger.error('Get categories error', { error });
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Export analytics
router.get('/export', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { format = 'csv' } = req.query;

    // In production, generate actual export
    const data = {
      generatedAt: new Date().toISOString(),
      tenantId: req.user!.tenantId,
      summary: {
        totalAudits: 156,
        averageScore: 68,
        totalClients: 12
      }
    };

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics.json');
      res.json(data);
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
      res.send('Metric,Value\nTotal Audits,156\nAverage Score,68\nTotal Clients,12');
    }
  } catch (error) {
    logger.error('Export analytics error', { error });
    res.status(500).json({ error: 'Failed to export analytics' });
  }
});

// Helper function to generate trend data
function generateTrendData(period: string) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      audits: Math.floor(Math.random() * 10) + 2,
      avgScore: Math.floor(Math.random() * 20) + 55,
      newClients: Math.random() > 0.7 ? 1 : 0
    });
  }

  return data;
}

export default router;
