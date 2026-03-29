import { Router, Response } from 'express';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// In-memory store
const tenantSettings: Map<string, any> = new Map();

// Default settings
const DEFAULT_SETTINGS = {
  branding: {
    brandName: 'PulseSEO',
    logoUrl: null,
    primaryColor: '#818CF8',
    theme: 'dark'
  },
  notifications: {
    emailAlerts: true,
    weeklyDigest: true,
    auditComplete: true,
    teamUpdates: true
  },
  api: {
    enabled: false,
    rateLimit: 1000,
    webhooks: []
  },
  integrations: {
    googleAnalytics: { enabled: false, credentials: null },
    searchConsole: { enabled: false, credentials: null },
    googleAds: { enabled: false, credentials: null }
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 30,
    ipWhitelist: []
  }
};

// Get tenant settings
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const settings = tenantSettings.get(req.user!.tenantId) || DEFAULT_SETTINGS;
    res.json({ settings });
  } catch (error) {
    logger.error('Get settings error', { error });
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update branding settings
router.patch('/branding', authenticate, authorize('owner', 'admin'), (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const currentSettings = tenantSettings.get(tenantId) || { ...DEFAULT_SETTINGS };

    const allowedFields = ['brandName', 'logoUrl', 'primaryColor', 'theme'];
    const updates = Object.keys(req.body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    currentSettings.branding = { ...currentSettings.branding, ...updates };
    tenantSettings.set(tenantId, currentSettings);

    logger.info('Branding settings updated', { tenantId });

    res.json({ settings: currentSettings });
  } catch (error) {
    logger.error('Update branding error', { error });
    res.status(500).json({ error: 'Failed to update branding settings' });
  }
});

// Update notification settings
router.patch('/notifications', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const currentSettings = tenantSettings.get(tenantId) || { ...DEFAULT_SETTINGS };

    const allowedFields = ['emailAlerts', 'weeklyDigest', 'auditComplete', 'teamUpdates'];
    const updates = Object.keys(req.body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    currentSettings.notifications = { ...currentSettings.notifications, ...updates };
    tenantSettings.set(tenantId, currentSettings);

    res.json({ settings: currentSettings });
  } catch (error) {
    logger.error('Update notifications error', { error });
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

// API settings
router.get('/api', authenticate, authorize('owner', 'admin'), (req: AuthRequest, res: Response) => {
  try {
    const settings = tenantSettings.get(req.user!.tenantId) || DEFAULT_SETTINGS;
    res.json({ api: settings.api });
  } catch (error) {
    logger.error('Get API settings error', { error });
    res.status(500).json({ error: 'Failed to fetch API settings' });
  }
});

// Generate API key
router.post('/api/keys', authenticate, authorize('owner', 'admin'), (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const apiKey = `pseo_${generateRandomKey()}`;

    const tenantId = req.user!.tenantId;
    const settings = tenantSettings.get(tenantId) || { ...DEFAULT_SETTINGS };

    if (!settings.api.keys) {
      settings.api.keys = [];
    }

    settings.api.keys.push({
      id: generateRandomKey(),
      name: name || 'Default Key',
      key: apiKey,
      createdAt: new Date().toISOString(),
      lastUsed: null
    });

    tenantSettings.set(tenantId, settings);

    logger.info('API key generated', { tenantId });

    res.status(201).json({ 
      message: 'API key generated',
      apiKey 
    });
  } catch (error) {
    logger.error('Generate API key error', { error });
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

// Revoke API key
router.delete('/api/keys/:keyId', authenticate, authorize('owner', 'admin'), (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const settings = tenantSettings.get(tenantId) || DEFAULT_SETTINGS;

    if (settings.api.keys) {
      settings.api.keys = settings.api.keys.filter((k: any) => k.id !== req.params.keyId);
      tenantSettings.set(tenantId, settings);
    }

    res.json({ message: 'API key revoked' });
  } catch (error) {
    logger.error('Revoke API key error', { error });
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

// Webhooks
router.get('/api/webhooks', authenticate, authorize('owner', 'admin'), (req: AuthRequest, res: Response) => {
  try {
    const settings = tenantSettings.get(req.user!.tenantId) || DEFAULT_SETTINGS;
    res.json({ webhooks: settings.api.webhooks || [] });
  } catch (error) {
    logger.error('Get webhooks error', { error });
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

router.post('/api/webhooks', authenticate, authorize('owner', 'admin'), (req: AuthRequest, res: Response) => {
  try {
    const { url, events, name } = req.body;

    const tenantId = req.user!.tenantId;
    const settings = tenantSettings.get(tenantId) || { ...DEFAULT_SETTINGS };

    if (!settings.api.webhooks) {
      settings.api.webhooks = [];
    }

    settings.api.webhooks.push({
      id: generateRandomKey(),
      name: name || 'Webhook',
      url,
      events: events || ['audit.completed', 'report.generated'],
      active: true,
      createdAt: new Date().toISOString()
    });

    tenantSettings.set(tenantId, settings);

    res.status(201).json({ 
      message: 'Webhook created',
      webhook: settings.api.webhooks[settings.api.webhooks.length - 1]
    });
  } catch (error) {
    logger.error('Create webhook error', { error });
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

// Integrations
router.get('/integrations', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const settings = tenantSettings.get(req.user!.tenantId) || DEFAULT_SETTINGS;
    res.json({ integrations: settings.integrations });
  } catch (error) {
    logger.error('Get integrations error', { error });
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Security settings
router.patch('/security', authenticate, authorize('owner', 'admin'), (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const currentSettings = tenantSettings.get(tenantId) || { ...DEFAULT_SETTINGS };

    const allowedFields = ['twoFactorEnabled', 'sessionTimeout', 'ipWhitelist'];
    const updates = Object.keys(req.body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    currentSettings.security = { ...currentSettings.security, ...updates };
    tenantSettings.set(tenantId, currentSettings);

    logger.info('Security settings updated', { tenantId });

    res.json({ settings: currentSettings });
  } catch (error) {
    logger.error('Update security error', { error });
    res.status(500).json({ error: 'Failed to update security settings' });
  }
});

// Helper function
function generateRandomKey(): string {
  return Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('');
}

export default router;
