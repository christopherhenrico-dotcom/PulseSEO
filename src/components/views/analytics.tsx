import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, FileText, Award, AlertTriangle, Download } from 'lucide-react';
import { api } from '../../services/api';

interface AnalyticsData {
  overview: {
    totalAudits: number;
    totalClients: number;
    averageScore: number;
    auditsThisMonth: number;
    auditsGrowth: number;
    clientsGrowth: number;
  };
  scoreDistribution: Array<{ range: string; count: number; percentage: number }>;
  recentActivity: Array<{ type: string; description: string; timestamp: string; score?: number }>;
  topPerformers: Array<{ business: string; score: number; change: number }>;
  needsAttention: Array<{ business: string; score: number; issues: string[] }>;
}

interface AnalyticsViewProps {
  onNavigate?: (view: string) => void;
}

export function AnalyticsView({ onNavigate }: AnalyticsViewProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    const response = await api.getDashboardAnalytics();
    if (response.data?.analytics) {
      setAnalytics(response.data.analytics);
    }
    setLoading(false);
  };

  const handleExport = async () => {
    const response = await api.request('/analytics/export?format=csv');
    if (response.data) {
      // Trigger download
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Analytics Dashboard</h1>
          <p className="text-secondary">Track your SEO audit performance</p>
        </div>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-surface border border-white/10 rounded-lg px-4 py-2 text-primary"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-white/10 rounded-lg text-secondary hover:text-primary hover:bg-white/5"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Audits"
          value={analytics.overview.totalAudits.toLocaleString()}
          change={analytics.overview.auditsGrowth}
          icon={<FileText className="w-5 h-5" />}
        />
        <StatCard
          title="Total Clients"
          value={analytics.overview.totalClients.toLocaleString()}
          change={analytics.overview.clientsGrowth}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Average Score"
          value={analytics.overview.averageScore.toString()}
          icon={<Award className="w-5 h-5" />}
        />
        <StatCard
          title="This Month"
          value={analytics.overview.auditsThisMonth.toLocaleString()}
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-surface rounded-xl p-6 border border-white/5">
          <h2 className="text-lg font-semibold text-primary mb-4">Score Distribution</h2>
          <div className="space-y-3">
            {analytics.scoreDistribution.map((item) => (
              <div key={item.range} className="flex items-center gap-3">
                <span className="w-16 text-secondary text-sm">{item.range}</span>
                <div className="flex-1 h-6 bg-background rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getScoreColor(item.range)}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-12 text-right text-secondary text-sm">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-surface rounded-xl p-6 border border-white/5">
          <h2 className="text-lg font-semibold text-primary mb-4">Top Performers</h2>
          <div className="space-y-3">
            {analytics.topPerformers.map((item, index) => (
              <div key={item.business} className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-primary">{item.business}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500 font-semibold">{item.score}</span>
                  <span className={`text-xs ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.change >= 0 ? '+' : ''}{item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Attention */}
        <div className="bg-surface rounded-xl p-6 border border-white/5">
          <h2 className="text-lg font-semibold text-primary mb-4">Needs Attention</h2>
          <div className="space-y-3">
            {analytics.needsAttention.map((item) => (
              <div key={item.business} className="p-4 bg-red-500/5 border border-red-500/10 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-primary font-medium">{item.business}</span>
                  <span className="text-red-500 font-bold">{item.score}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.issues.slice(0, 3).map((issue, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded">
                      {issue}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('audit')}
              className="w-full mt-4 py-2 text-primary hover:bg-white/5 rounded-lg transition-colors"
            >
              Create New Audit
            </button>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-surface rounded-xl p-6 border border-white/5">
          <h2 className="text-lg font-semibold text-primary mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {analytics.recentActivity.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                <div className={`p-2 rounded-lg ${getActivityColor(item.type)}`}>
                  {getActivityIcon(item.type)}
                </div>
                <div className="flex-1">
                  <p className="text-primary text-sm">{item.description}</p>
                  <p className="text-tertiary text-xs">
                    {formatTimeAgo(item.timestamp)}
                  </p>
                </div>
                {item.score && (
                  <span className={`font-semibold ${getScoreTextColor(item.score)}`}>
                    {item.score}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon }: {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-surface rounded-xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-secondary">{title}</span>
        <span className="text-tertiary">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-primary">{value}</span>
        {change !== undefined && (
          <span className={`text-sm flex items-center gap-1 mb-1 ${
            change >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}

function getScoreColor(range: string): string {
  if (range.includes('90') || range.includes('80')) return 'bg-green-500';
  if (range.includes('70') || range.includes('60')) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

function getActivityColor(type: string): string {
  switch (type) {
    case 'audit': return 'bg-primary/20 text-primary';
    case 'client': return 'bg-green-500/20 text-green-500';
    case 'report': return 'bg-purple-500/20 text-purple-500';
    default: return 'bg-gray-500/20 text-gray-500';
  }
}

function getActivityIcon(type: string): React.ReactNode {
  switch (type) {
    case 'audit': return <FileText className="w-4 h-4" />;
    case 'client': return <Users className="w-4 h-4" />;
    case 'report': return <Download className="w-4 h-4" />;
    default: return <AlertTriangle className="w-4 h-4" />;
  }
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}
