import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Stripe integration placeholder
// In production, initialize Stripe with: const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: {
      auditsPerMonth: 10,
      clients: 1,
      teamMembers: 1,
      exports: true,
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: false
    }
  },
  pro: {
    name: 'Professional',
    price: 49,
    stripePriceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    features: {
      auditsPerMonth: 500,
      clients: 25,
      teamMembers: 5,
      exports: true,
      apiAccess: true,
      whiteLabel: true,
      prioritySupport: true,
      scheduledAudits: true,
      customReports: true
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    stripePriceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
    features: {
      auditsPerMonth: -1, // Unlimited
      clients: -1,
      teamMembers: -1,
      exports: true,
      apiAccess: true,
      whiteLabel: true,
      prioritySupport: true,
      scheduledAudits: true,
      customReports: true,
      dedicatedSupport: true,
      customIntegrations: true,
      slaGuarantee: '99.9%'
    }
  }
};

// Get plans
router.get('/plans', (req, res) => {
  res.json({ plans: PLANS });
});

// Get current subscription
router.get('/subscription', authenticate, (req: AuthRequest, res: Response) => {
  // In production, fetch from Stripe
  const subscription = {
    plan: req.user!.plan,
    status: 'active',
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false,
    features: PLANS[req.user!.plan as keyof typeof PLANS]?.features || PLANS.free.features
  };
  res.json({ subscription });
});

// Create checkout session
router.post('/checkout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;

    // In production:
    // const session = await stripe.checkout.sessions.create({
    //   customer_email: req.user!.email,
    //   line_items: [{ price: PLANS[planId].stripePriceId, quantity: 1 }],
    //   mode: 'subscription',
    //   success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
    //   metadata: { tenantId: req.user!.tenantId }
    // });

    logger.info('Checkout session created', { userId: req.user!.id, planId });

    res.json({
      message: 'Checkout session created',
      // In production: sessionId: session.id, url: session.url
      sessionId: 'placeholder_session_id',
      url: `/billing/subscribe?plan=${planId}`
    });
  } catch (error) {
    logger.error('Checkout error', { error });
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create portal session (for managing subscription)
router.post('/portal', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // In production:
    // const session = await stripe.billingPortal.sessions.create({
    //   customer: await getStripeCustomerId(req.user!.tenantId),
    //   return_url: `${process.env.FRONTEND_URL}/billing`
    // });

    logger.info('Portal session created', { userId: req.user!.id });

    res.json({
      message: 'Portal session created',
      // In production: url: session.url
      url: '/billing/manage'
    });
  } catch (error) {
    logger.error('Portal error', { error });
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Get invoices
router.get('/invoices', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // In production, fetch from Stripe
    const invoices = [
      {
        id: 'inv_placeholder_1',
        number: 'INV-001',
        date: new Date().toISOString(),
        amount: PLANS[req.user!.plan as keyof typeof PLANS]?.price || 0,
        currency: 'USD',
        status: 'paid',
        pdfUrl: '/api/billing/invoices/inv_placeholder_1/pdf'
      }
    ];

    res.json({ invoices });
  } catch (error) {
    logger.error('Get invoices error', { error });
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Usage statistics
router.get('/usage', authenticate, (req: AuthRequest, res: Response) => {
  const plan = PLANS[req.user!.plan as keyof typeof PLANS] || PLANS.free;
  
  // In production, fetch actual usage from database
  const usage = {
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    },
    audits: {
      used: 15,
      limit: plan.features.auditsPerMonth,
      percentage: plan.features.auditsPerMonth === -1 ? 0 : Math.round((15 / plan.features.auditsPerMonth) * 100)
    },
    clients: {
      used: 3,
      limit: plan.features.clients,
      percentage: plan.features.clients === -1 ? 0 : Math.round((3 / plan.features.clients) * 100)
    },
    teamMembers: {
      used: 1,
      limit: plan.features.teamMembers,
      percentage: plan.features.teamMembers === -1 ? 0 : Math.round((1 / plan.features.teamMembers) * 100)
    },
    apiCalls: {
      used: 1250,
      limit: plan.features.apiAccess ? 10000 : 0,
      percentage: plan.features.apiAccess ? 12.5 : 0
    }
  };

  res.json({ usage });
});

// Stripe webhook handler (placeholder)
router.post('/webhook', async (req, res) => {
  // In production, verify Stripe signature and handle events
  // const sig = req.headers['stripe-signature'];
  // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

  const event = req.body;

  logger.info('Webhook received', { type: event.type });

  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful checkout
      break;
    case 'invoice.paid':
      // Handle successful payment
      break;
    case 'invoice.payment_failed':
      // Handle failed payment
      break;
    case 'customer.subscription.updated':
      // Handle subscription update
      break;
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      break;
    default:
      logger.info('Unhandled webhook event', { type: event.type });
  }

  res.json({ received: true });
});

export default router;
