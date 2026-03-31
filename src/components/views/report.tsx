/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, ShieldCheck, AlertCircle, Globe, Zap, Mail, 
  TrendingUp, TrendingDown, Minus, Eye, MousePointer, Target, Users,
  DollarSign, BarChart3, Search, ArrowUpRight, ArrowDownRight, Activity,
  Layers, PieChart, LineChart, Download
} from 'lucide-react';
import { AuditResult, WhiteLabelSettings, View, SEOReportData } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportProps {
  selectedAudit: AuditResult;
  settings: WhiteLabelSettings;
  setView: React.Dispatch<React.SetStateAction<View>>;
}

type TabType = 'summary' | 'visibility' | 'traffic' | 'conversions';

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
      active ? 'bg-primary/15 text-primary' : 'text-tertiary hover:text-primary hover:bg-white/[0.03]'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const MetricCard: React.FC<{ 
  title: string; 
  value: string | number; 
  change: number; 
  suffix?: string;
  icon: React.ReactNode;
}> = ({ title, value, change, suffix = '', icon }) => {
  const isPositive = change > 0;
  const isNeutral = change === 0;
  
  return (
    <div className="glass-card p-5 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">{title}</span>
        <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-secondary">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-light text-primary">{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</span>
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-success' : isNeutral ? 'text-tertiary' : 'text-error'}`}>
          {isPositive ? <TrendingUp size={14} /> : isNeutral ? <Minus size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(change).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

const ChangeIndicator: React.FC<{ change: number }> = ({ change }) => {
  if (change > 0) return <span className="text-success flex items-center gap-1 text-xs font-medium"><ArrowUpRight size={12} />+{change}</span>;
  if (change < 0) return <span className="text-error flex items-center gap-1 text-xs font-medium"><ArrowDownRight size={12} />{change}</span>;
  return <span className="text-tertiary text-xs">-</span>;
};

export const Report: React.FC<ReportProps> = ({ selectedAudit, settings, setView }) => {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!selectedAudit) return null;

  const { business, analysis } = selectedAudit;
  const reportData = analysis.reportData;

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    const height = pdfWidth / ratio;

    pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, pdfWidth, height);
    pdf.save(`SEO_Audit_${business.name.replace(/ /g, '_')}.pdf`);
    
    setIsDownloading(false);
  };

  const renderSummary = () => (
    <div className="space-y-8">
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
            <ShieldCheck size={18} className="text-primary" />
          </div>
          <h2 className="text-lg font-medium text-primary">Executive Summary</h2>
        </div>
        <div className="glass p-5 rounded-xl">
          <p className="text-secondary leading-relaxed text-sm">{reportData?.performance.summaryText}</p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-medium text-primary">Key Performance Indicators</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard 
            title="Sessions" 
            value={reportData?.performance.metrics.sessions.current || 0} 
            change={reportData?.performance.metrics.sessions.changePercent || 0}
            icon={<Activity size={14} />}
          />
          <MetricCard 
            title="Impressions" 
            value={reportData?.performance.metrics.impressions.current || 0} 
            change={reportData?.performance.metrics.impressions.changePercent || 0}
            icon={<Eye size={14} />}
          />
          <MetricCard 
            title="Clicks" 
            value={reportData?.performance.metrics.clicks.current || 0} 
            change={reportData?.performance.metrics.clicks.changePercent || 0}
            icon={<MousePointer size={14} />}
          />
          <MetricCard 
            title="Users" 
            value={reportData?.performance.metrics.totalUsers.current || 0} 
            change={reportData?.performance.metrics.totalUsers.changePercent || 0}
            icon={<Users size={14} />}
          />
          <MetricCard 
            title="Keywords" 
            value={reportData?.performance.metrics.keywordRankings.current || 0} 
            change={reportData?.performance.metrics.keywordRankings.changePercent || 0}
            icon={<Search size={14} />}
          />
          <MetricCard 
            title="Conversions" 
            value={reportData?.performance.metrics.conversions.current || 0} 
            change={reportData?.performance.metrics.conversions.changePercent || 0}
            icon={<Target size={14} />}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-medium text-primary">Quick Wins</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reportData?.performance.quickWins.map((win, idx) => (
            <div key={idx} className="glass p-4 rounded-xl flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
              </div>
              <span className="text-sm text-secondary">{win}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-medium text-primary">Recommendations</h3>
        <div className="space-y-3">
          {reportData?.recommendations.critical.length ? (
            <div className="glass p-5 rounded-xl border-l-4 border-error">
              <h4 className="font-medium text-error mb-3 flex items-center gap-2 text-sm">
                <AlertCircle size={16} /> Critical Issues
              </h4>
              <ul className="space-y-2">
                {reportData.recommendations.critical.map((item, idx) => (
                  <li key={idx} className="text-sm text-secondary flex items-start gap-2">
                    <span className="text-error mt-1">&#8226;</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          
          {reportData?.recommendations.high.length ? (
            <div className="glass p-5 rounded-xl border-l-4 border-warning">
              <h4 className="font-medium text-warning mb-3 flex items-center gap-2 text-sm">
                <TrendingUp size={16} /> High Priority
              </h4>
              <ul className="space-y-2">
                {reportData.recommendations.high.map((item, idx) => (
                  <li key={idx} className="text-sm text-secondary flex items-start gap-2">
                    <span className="text-warning mt-1">&#8226;</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {reportData?.recommendations.technical.length ? (
            <div className="glass p-5 rounded-xl border-l-4 border-primary">
              <h4 className="font-medium text-primary mb-3 flex items-center gap-2 text-sm">
                <Layers size={16} /> Technical SEO
              </h4>
              <ul className="space-y-2">
                {reportData.recommendations.technical.map((item, idx) => (
                  <li key={idx} className="text-sm text-secondary flex items-start gap-2">
                    <span className="text-tertiary mt-1">&#8226;</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
            <Globe size={18} className="text-primary" />
          </div>
          <h2 className="text-lg font-medium text-primary">Optimized GMB Description</h2>
        </div>
        <div className="p-5 glass rounded-xl text-secondary italic leading-relaxed text-sm">
          &ldquo;{analysis.suggestedDescription}&rdquo;
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
            <Zap size={18} className="text-primary" />
          </div>
          <h2 className="text-lg font-medium text-primary">AI Post Content Ideas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {analysis.suggestedPosts.map((post, i) => (
            <div key={i} className="p-5 border border-theme rounded-xl hover:border-theme-hover transition-colors">
              <div className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-2">Post Idea #{i+1}</div>
              <p className="text-sm text-secondary leading-relaxed">{post}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
            <Mail size={18} className="text-primary" />
          </div>
          <h2 className="text-lg font-medium text-primary">AI Review Response Examples</h2>
        </div>
        <div className="space-y-3">
          {analysis.reviewResponses.map((rr, i) => (
            <div key={i} className="p-6 border border-theme rounded-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-white/[0.06] flex-shrink-0" />
                <div className="space-y-1">
                  <div className="text-sm font-medium text-primary">Customer Review</div>
                  <p className="text-sm text-secondary italic">&ldquo;{rr.review}&rdquo;</p>
                </div>
              </div>
              <div className="pl-10 pt-3 border-t border-theme">
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2 text-primary">AI Suggested Response</div>
                <p className="text-sm text-secondary leading-relaxed">{rr.response}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderVisibility = () => (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-base font-medium text-primary">Visibility Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard 
            title="Impressions" 
            value={reportData?.visibility.overview.impressions.current || 0} 
            change={reportData?.visibility.overview.impressions.changePercent || 0}
            icon={<Eye size={14} />}
          />
          <MetricCard 
            title="Clicks" 
            value={reportData?.visibility.overview.clicks.current || 0} 
            change={reportData?.visibility.overview.clicks.changePercent || 0}
            icon={<MousePointer size={14} />}
          />
          <MetricCard 
            title="CTR" 
            value={reportData?.visibility.overview.ctr.current || 0} 
            suffix="%"
            change={reportData?.visibility.overview.ctr.change || 0}
            icon={<Target size={14} />}
          />
          <MetricCard 
            title="Avg Position" 
            value={reportData?.visibility.overview.avgPosition.current || 0} 
            change={reportData?.visibility.overview.avgPosition.change || 0}
            icon={<BarChart3 size={14} />}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-medium text-primary">Daily Performance Trend</h3>
        <div className="glass-card p-5 rounded-xl overflow-hidden">
          <div className="h-44 flex items-end gap-1">
            {reportData?.visibility.dailyData.slice(-14).map((day, idx) => (
              <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center gap-1">
                <div 
                  className="w-full rounded-t transition-all hover:opacity-80"
                  style={{ 
                    height: `${Math.min(100, (day.impressions / Math.max(...(reportData.visibility.dailyData.map(d => d.impressions) || [1]))) * 100)}%`,
                    backgroundColor: settings.primaryColor
                  }}
                  title={`${day.date}: ${day.impressions.toLocaleString()} impressions`}
                />
                <span className="text-[7px] text-tertiary transform -rotate-45 origin-left">{day.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-medium text-primary">Top Keywords</h3>
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme">
                  <th className="text-left p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Keyword</th>
                  <th className="text-right p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Position</th>
                  <th className="text-right p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Change</th>
                  <th className="text-right p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Impressions</th>
                  <th className="text-right p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Clicks</th>
                  <th className="text-right p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">CTR</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.visibility.keywordPerformance.slice(0, 10).map((kw, idx) => (
                  <tr key={idx} className="border-b border-theme hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 text-sm text-primary">{kw.keyword}</td>
                    <td className="p-3 text-right text-sm text-secondary">{kw.position}</td>
                    <td className="p-3 text-right"><ChangeIndicator change={kw.change} /></td>
                    <td className="p-3 text-right text-sm text-secondary">{kw.impressions.toLocaleString()}</td>
                    <td className="p-3 text-right text-sm text-secondary">{kw.clicks.toLocaleString()}</td>
                    <td className="p-3 text-right text-sm text-secondary">{kw.ctr}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="space-y-4">
          <h3 className="text-base font-medium text-primary">Branded Keywords</h3>
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme">
                  <th className="text-left p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Keyword</th>
                  <th className="text-right p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Pos</th>
                  <th className="text-right p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Change</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.visibility.brandedKeywords.slice(0, 5).map((kw, idx) => (
                  <tr key={idx} className="border-b border-theme">
                    <td className="p-3 text-sm text-primary">{kw.keyword}</td>
                    <td className="p-3 text-sm text-right text-secondary">{kw.position}</td>
                    <td className="p-3 text-sm text-right"><ChangeIndicator change={kw.change} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-base font-medium text-primary">Non-Branded Keywords</h3>
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme">
                  <th className="text-left p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Keyword</th>
                  <th className="text-right p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Pos</th>
                  <th className="text-right p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Change</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.visibility.nonBrandedKeywords.slice(0, 5).map((kw, idx) => (
                  <tr key={idx} className="border-b border-theme">
                    <td className="p-3 text-sm text-primary">{kw.keyword}</td>
                    <td className="p-3 text-sm text-right text-secondary">{kw.position}</td>
                    <td className="p-3 text-sm text-right"><ChangeIndicator change={kw.change} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );

  const renderTraffic = () => (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-base font-medium text-primary">Traffic Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MetricCard 
            title="Sessions" 
            value={reportData?.traffic.summary.sessions.current || 0} 
            change={reportData?.traffic.summary.sessions.changePercent || 0}
            icon={<Activity size={14} />}
          />
          <MetricCard 
            title="Users" 
            value={reportData?.traffic.summary.users.current || 0} 
            change={reportData?.traffic.summary.users.changePercent || 0}
            icon={<Users size={14} />}
          />
          <MetricCard 
            title="New Users" 
            value={reportData?.traffic.summary.newUsers.current || 0} 
            change={reportData?.traffic.summary.newUsers.changePercent || 0}
            icon={<Users size={14} />}
          />
          <MetricCard 
            title="Conversions" 
            value={reportData?.traffic.summary.conversions.current || 0} 
            change={reportData?.traffic.summary.conversions.changePercent || 0}
            icon={<Target size={14} />}
          />
          <MetricCard 
            title="Revenue" 
            value={reportData?.traffic.summary.revenue.current || 0} 
            change={reportData?.traffic.summary.revenue.changePercent || 0}
            suffix="$"
            icon={<DollarSign size={14} />}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="space-y-4">
          <h3 className="text-base font-medium text-primary flex items-center gap-2">
            <PieChart size={16} /> Sessions by Channel
          </h3>
          <div className="glass-card p-5 rounded-xl">
            <div className="space-y-3">
              {reportData?.traffic.sessionsByChannel.map((channel, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">{channel.channel}</span>
                    <span className="text-primary font-medium">{channel.sessions.toLocaleString()} ({channel.percentage}%)</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${channel.percentage}%`, backgroundColor: settings.primaryColor }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-base font-medium text-primary flex items-center gap-2">
            <PieChart size={16} /> Sessions by Device
          </h3>
          <div className="glass-card p-5 rounded-xl">
            <div className="space-y-3">
              {reportData?.traffic.sessionsByDevice.map((device, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">{device.device}</span>
                    <span className="text-primary font-medium">{device.sessions.toLocaleString()} ({device.percentage}%)</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${device.percentage}%`, backgroundColor: settings.primaryColor }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="space-y-4">
        <h3 className="text-base font-medium text-primary flex items-center gap-2">
          <LineChart size={16} /> Monthly Trends
        </h3>
        <div className="glass-card p-5 rounded-xl">
          <div className="h-44 flex items-end gap-1.5">
            {reportData?.traffic.monthlyTrends.map((month, idx) => (
              <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center gap-1">
                <div className="w-full flex gap-1 items-end" style={{ height: '140px' }}>
                  <div 
                    className="flex-1 rounded-t transition-all hover:opacity-80"
                    style={{ 
                      height: `${(month.sessions / Math.max(...(reportData.traffic.monthlyTrends?.map(m => m.sessions) || [1]))) * 100}%`,
                      backgroundColor: settings.primaryColor,
                      opacity: 0.8
                    }}
                    title={`Sessions: ${month.sessions.toLocaleString()}`}
                  />
                  <div 
                    className="flex-1 rounded-t transition-all hover:opacity-80"
                    style={{ 
                      height: `${(month.users / Math.max(...(reportData.traffic.monthlyTrends?.map(m => m.users) || [1]))) * 100}%`,
                      backgroundColor: settings.primaryColor,
                      opacity: 0.4
                    }}
                    title={`Users: ${month.users.toLocaleString()}`}
                  />
                </div>
                <span className="text-[10px] text-tertiary">{month.month}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: settings.primaryColor, opacity: 0.8 }} />
              <span className="text-xs text-secondary">Sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: settings.primaryColor, opacity: 0.4 }} />
              <span className="text-xs text-secondary">Users</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-medium text-primary">Landing Page Performance</h3>
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme">
                  <th className="text-left p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Page</th>
                  <th className="text-right p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Sessions</th>
                  <th className="text-right p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Users</th>
                  <th className="text-right p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Engagement</th>
                  <th className="text-right p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Conversions</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.traffic.landingPages.slice(0, 8).map((page, idx) => (
                  <tr key={idx} className="border-b border-theme hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 text-sm text-primary">{page.path}</td>
                    <td className="p-3 text-right text-sm text-secondary">{page.sessions.toLocaleString()}</td>
                    <td className="p-3 text-right text-sm text-secondary">{page.users.toLocaleString()}</td>
                    <td className="p-3 text-right text-sm text-secondary">{page.engagement}%</td>
                    <td className="p-3 text-right text-sm text-secondary">{page.conversions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );

  const renderConversions = () => (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-base font-medium text-primary">Conversion Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard 
            title="Conversions" 
            value={reportData?.conversions.summary.conversions.current || 0} 
            change={reportData?.conversions.summary.conversions.changePercent || 0}
            icon={<Target size={14} />}
          />
          <MetricCard 
            title="Transactions" 
            value={reportData?.conversions.summary.transactions.current || 0} 
            change={reportData?.conversions.summary.transactions.changePercent || 0}
            icon={<Activity size={14} />}
          />
          <MetricCard 
            title="Revenue" 
            value={reportData?.conversions.summary.revenue.current || 0} 
            suffix="$"
            change={reportData?.conversions.summary.revenue.changePercent || 0}
            icon={<DollarSign size={14} />}
          />
          <MetricCard 
            title="Conv. Rate" 
            value={reportData?.conversions.summary.conversionRate.current || 0} 
            suffix="%"
            change={reportData?.conversions.summary.conversionRate.change || 0}
            icon={<BarChart3 size={14} />}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-medium text-primary">Daily Conversions Trend</h3>
        <div className="glass-card p-5 rounded-xl">
          <div className="h-36 flex items-end gap-1">
            {reportData?.conversions.dailyConversions.slice(-14).map((day, idx) => (
              <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center gap-1">
                <div 
                  className="w-full rounded-t transition-all hover:opacity-80"
                  style={{ 
                    height: `${Math.min(100, (day.conversions / Math.max(...(reportData.conversions.dailyConversions?.map(d => d.conversions) || [1]))) * 100)}%`,
                    backgroundColor: settings.primaryColor
                  }}
                  title={`${day.date}: ${day.conversions} conversions, $${day.revenue}`}
                />
                <span className="text-[7px] text-tertiary transform -rotate-45 origin-left">{day.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="space-y-4">
          <h3 className="text-base font-medium text-primary">Top Converting Pages</h3>
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme">
                  <th className="text-left p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Page</th>
                  <th className="text-right p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Conv.</th>
                  <th className="text-right p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.conversions.pagePathPerformance.map((page, idx) => (
                  <tr key={idx} className="border-b border-theme">
                    <td className="p-3 text-sm text-primary">{page.path}</td>
                    <td className="p-3 text-sm text-right text-secondary">{page.conversions}</td>
                    <td className="p-3 text-sm text-right text-secondary">${page.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-base font-medium text-primary">Traffic Source Conversions</h3>
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme">
                  <th className="text-left p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Source</th>
                  <th className="text-right p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Conv.</th>
                  <th className="text-right p-3 text-[10px] font-bold uppercase tracking-widest text-tertiary">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.conversions.trafficSourceConversions.map((source, idx) => (
                  <tr key={idx} className="border-b border-theme">
                    <td className="p-3 text-sm text-primary">{source.source}</td>
                    <td className="p-3 text-sm text-right text-secondary">{source.conversions}</td>
                    <td className="p-3 text-sm text-right text-secondary">${source.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="max-w-6xl mx-auto space-y-5 py-5 pb-20"
    >
      <div className="flex justify-between items-start">
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center gap-1.5 text-secondary hover:text-primary transition-colors text-sm"
        >
          <ChevronRight className="rotate-180" size={16} />
          <span>Back to Dashboard</span>
        </button>
        <button 
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="px-4 py-2 glass-card rounded-lg hover:glass-hover transition-all flex items-center gap-2 text-secondary text-sm"
        >
          {isDownloading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <Download size={14} />
            </motion.div>
          ) : (
            <Download size={14} />
          )}
          <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
        </button>
      </div>

      <div ref={reportRef} className="glass-card rounded-2xl overflow-hidden">
        <div className="p-7 bg-white/[0.02] border-b border-theme">
          <div className="flex flex-col md:flex-row justify-between items-center gap-5">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary mb-1.5">
                <ShieldCheck size={12} className="text-primary" /> SEO Report
              </div>
              <h1 className="text-2xl font-light tracking-tight text-primary">{business.name}</h1>
              <p className="text-sm text-secondary">{business.category} &middot; {business.location}</p>
              {reportData?.dateRange && (
                <p className="text-xs text-tertiary mt-1.5">
                  Reporting Period: {reportData.dateRange.start} to {reportData.dateRange.end}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-light text-primary">{analysis.seoScore}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-tertiary">SEO Score</div>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-white/[0.06]" />
                  <circle 
                    cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="transparent" 
                    strokeDasharray={175.9}
                    strokeDashoffset={175.9 - (175.9 * analysis.seoScore) / 100}
                    className="transition-all duration-1000 ease-out"
                    style={{ color: settings.primaryColor }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-theme overflow-x-auto">
          <div className="flex gap-1.5 p-3 min-w-max">
            <TabButton active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} icon={<ShieldCheck size={14} />} label="Summary" />
            <TabButton active={activeTab === 'visibility'} onClick={() => setActiveTab('visibility')} icon={<Eye size={14} />} label="Visibility" />
            <TabButton active={activeTab === 'traffic'} onClick={() => setActiveTab('traffic')} icon={<BarChart3 size={14} />} label="Traffic" />
            <TabButton active={activeTab === 'conversions'} onClick={() => setActiveTab('conversions')} icon={<Target size={14} />} label="Conversions" />
          </div>
        </div>

        <div className="p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'summary' && renderSummary()}
              {activeTab === 'visibility' && renderVisibility()}
              {activeTab === 'traffic' && renderTraffic()}
              {activeTab === 'conversions' && renderConversions()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-5 bg-white/[0.02] border-t border-theme flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-tertiary">
          <div className="flex items-center gap-2">
            {settings.logoUrl && <img src={settings.logoUrl} alt={`${settings.brandName} logo`} className="h-5 w-auto" />}
            <span className="font-semibold text-primary">{settings.brandName}</span>
          </div>
          <div className="flex items-center gap-5">
            {settings.supportEmail && (
              <a href={`mailto:${settings.supportEmail}`} className="hover:text-primary transition-colors">{settings.supportEmail}</a>
            )}
            <span>Generated {new Date(selectedAudit.timestamp).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Report;
