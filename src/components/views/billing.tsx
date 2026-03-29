import React, { useState, useEffect } from 'react';
import { Check, Zap, Crown, Building2, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

interface Plan {
  name: string;
  price: number;
  stripePriceId?: string;
  features: {
    auditsPerMonth: number;
    clients: number;
    teamMembers: number;
    exports: boolean;
    apiAccess: boolean;
    whiteLabel: boolean;
    prioritySupport: boolean;
    scheduledAudits?: boolean;
    customReports?: boolean;
    dedicatedSupport?: boolean;
    customIntegrations?: boolean;
    slaGuarantee?: string;
  };
}

interface BillingViewProps {
  user: any;
  onUpgrade?: () => void;
}

export function BillingView({ user, onUpgrade }: BillingViewProps) {
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [currentPlan, setCurrentPlan] = useState(user?.plan || 'free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const response = await api.getPlans();
    if (response.data?.plans) {
      setPlans(response.data.plans);
    }
    setLoading(false);
  };

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentPlan) return;
    
    const response = await api.createCheckoutSession(planId);
    if (response.data?.url) {
      // In production, redirect to Stripe checkout
      window.location.href = response.data.url;
    }
  };

  const formatLimit = (value: number): string => {
    if (value === -1) return 'Unlimited';
    return value.toLocaleString();
  };

  const planIcons: Record<string, React.ReactNode> = {
    free: <Zap className="w-6 h-6" />,
    pro: <Crown className="w-6 h-6" />,
    enterprise: <Building2 className="w-6 h-6" />,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-primary mb-4">Choose Your Plan</h1>
        <p className="text-secondary max-w-2xl mx-auto">
          Scale your SEO audit business with the right tools. Start free and upgrade as you grow.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(plans).map(([id, plan]) => {
          const isCurrentPlan = id === currentPlan;
          const isPopular = id === 'pro';

          return (
            <div
              key={id}
              className={`relative rounded-2xl p-6 transition-all ${
                isPopular
                  ? 'bg-gradient-to-b from-primary/20 to-surface border-2 border-primary'
                  : 'bg-surface border border-white/5'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className={`inline-flex p-3 rounded-xl mb-4 ${
                  isPopular ? 'bg-primary/20 text-primary' : 'bg-white/5 text-secondary'
                }`}>
                  {planIcons[id]}
                </div>
                <h3 className="text-xl font-semibold text-primary">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-primary">${plan.price}</span>
                  <span className="text-secondary">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-secondary">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{formatLimit(plan.features.auditsPerMonth)} audits/month</span>
                </li>
                <li className="flex items-center gap-2 text-secondary">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{formatLimit(plan.features.clients)} clients</span>
                </li>
                <li className="flex items-center gap-2 text-secondary">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{formatLimit(plan.features.teamMembers)} team members</span>
                </li>
                {plan.features.exports && (
                  <li className="flex items-center gap-2 text-secondary">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>CSV & PDF exports</span>
                  </li>
                )}
                {plan.features.apiAccess && (
                  <li className="flex items-center gap-2 text-secondary">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>API access</span>
                  </li>
                )}
                {plan.features.whiteLabel && (
                  <li className="flex items-center gap-2 text-secondary">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>White-label branding</span>
                  </li>
                )}
                {plan.features.scheduledAudits && (
                  <li className="flex items-center gap-2 text-secondary">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Scheduled audits</span>
                  </li>
                )}
                {plan.features.customReports && (
                  <li className="flex items-center gap-2 text-secondary">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Custom reports</span>
                  </li>
                )}
                {plan.features.prioritySupport && (
                  <li className="flex items-center gap-2 text-secondary">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                )}
                {plan.features.dedicatedSupport && (
                  <li className="flex items-center gap-2 text-secondary">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Dedicated account manager</span>
                  </li>
                )}
                {plan.features.slaGuarantee && (
                  <li className="flex items-center gap-2 text-secondary">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{plan.features.slaGuarantee} uptime SLA</span>
                  </li>
                )}
              </ul>

              <button
                onClick={() => handleSelectPlan(id)}
                disabled={isCurrentPlan}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                  isCurrentPlan
                    ? 'bg-white/5 text-tertiary cursor-not-allowed'
                    : isPopular
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-white/10 text-primary hover:bg-white/20'
                }`}
              >
                {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Get Started' : 'Upgrade'}
                {!isCurrentPlan && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-secondary mb-4">
          All plans include a 14-day free trial. No credit card required for free plan.
        </p>
        <p className="text-sm text-tertiary">
          Need a custom plan for your enterprise?{' '}
          <a href="mailto:sales@pulseseo.com" className="text-primary hover:underline">
            Contact Sales
          </a>
        </p>
      </div>
    </div>
  );
}

export function UsageView() {
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    const response = await api.getUsage();
    if (response.data?.usage) {
      setUsage(response.data.usage);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!usage) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-primary mb-6">Usage & Limits</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <UsageCard
          title="Audits"
          used={usage.audits.used}
          limit={usage.audits.limit}
          percentage={usage.audits.percentage}
          color="primary"
        />
        <UsageCard
          title="Clients"
          used={usage.clients.used}
          limit={usage.clients.limit}
          percentage={usage.clients.percentage}
          color="secondary"
        />
        <UsageCard
          title="Team Members"
          used={usage.teamMembers.used}
          limit={usage.teamMembers.limit}
          percentage={usage.teamMembers.percentage}
          color="accent"
        />
        <UsageCard
          title="API Calls"
          used={usage.apiCalls.used}
          limit={usage.apiCalls.limit}
          percentage={usage.apiCalls.percentage}
          color="warning"
        />
      </div>

      <div className="mt-6 p-4 bg-surface rounded-xl border border-white/5">
        <h3 className="font-medium text-primary mb-2">Billing Period</h3>
        <p className="text-secondary text-sm">
          {new Date(usage.period.start).toLocaleDateString()} - {new Date(usage.period.end).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function UsageCard({ title, used, limit, percentage, color }: {
  title: string;
  used: number;
  limit: number;
  percentage: number;
  color: string;
}) {
  const isUnlimited = limit === -1;
  const isWarning = percentage > 80;
  const isError = percentage > 95;

  return (
    <div className="bg-surface rounded-xl p-6 border border-white/5">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-medium text-primary">{title}</h3>
        {isWarning && !isUnlimited && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            isError ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {isError ? 'Almost full' : 'Running low'}
          </span>
        )}
      </div>

      <div className="mb-2">
        <span className="text-3xl font-bold text-primary">{used.toLocaleString()}</span>
        <span className="text-secondary"> / </span>
        <span className="text-secondary">{isUnlimited ? 'Unlimited' : limit.toLocaleString()}</span>
      </div>

      {!isUnlimited && (
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isError ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}

      {!isUnlimited && (
        <p className="text-xs text-tertiary mt-2">{percentage}% used</p>
      )}
    </div>
  );
}
