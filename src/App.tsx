/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Settings, 
  LayoutDashboard, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Share2, 
  Trash2, 
  ExternalLink,
  Zap,
  ShieldCheck,
  Globe,
  Mail,
  Palette,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { WhiteLabelSettings, BusinessInfo, AuditResult } from './types';
import { analyzeBusiness } from './services/geminiService';

const DEFAULT_SETTINGS: WhiteLabelSettings = {
  brandName: 'LocalPulse AI',
  primaryColor: '#000000',
  supportEmail: 'support@localpulse.ai'
};

export default function App() {
  const [settings, setSettings] = useState<WhiteLabelSettings>(() => {
    const saved = localStorage.getItem('lp_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [audits, setAudits] = useState<AuditResult[]>(() => {
    const saved = localStorage.getItem('lp_audits');
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setView] = useState<'dashboard' | 'audit' | 'settings' | 'report'>('dashboard');
  const [selectedAudit, setSelectedAudit] = useState<AuditResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newBusiness, setNewBusiness] = useState<BusinessInfo>({
    name: '',
    category: '',
    location: '',
    website: '',
    description: ''
  });

  useEffect(() => {
    localStorage.setItem('lp_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('lp_audits', JSON.stringify(audits));
  }, [audits]);

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeBusiness(newBusiness);
      const newAudit: AuditResult = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        business: { ...newBusiness },
        analysis
      };
      setAudits([newAudit, ...audits]);
      setSelectedAudit(newAudit);
      setView('report');
      setNewBusiness({ name: '', category: '', location: '', website: '', description: '' });
    } catch (error) {
      console.error('Audit failed:', error);
      alert('Failed to analyze business. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteAudit = (id: string) => {
    setAudits(audits.filter(a => a.id !== id));
    if (selectedAudit?.id === id) setSelectedAudit(null);
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your local SEO audits and reports.</p>
        </div>
        <button 
          onClick={() => setView('audit')}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all shadow-sm"
        >
          <Plus size={20} />
          <span>New Audit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-gray-400 mb-4">
            <Search size={18} />
            <span className="text-xs font-medium uppercase tracking-wider">Total Audits</span>
          </div>
          <div className="text-4xl font-light">{audits.length}</div>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-gray-400 mb-4">
            <ShieldCheck size={18} />
            <span className="text-xs font-medium uppercase tracking-wider">Avg. SEO Score</span>
          </div>
          <div className="text-4xl font-light">
            {audits.length > 0 
              ? Math.round(audits.reduce((acc, a) => acc + a.analysis.seoScore, 0) / audits.length)
              : 0}%
          </div>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-gray-400 mb-4">
            <Zap size={18} />
            <span className="text-xs font-medium uppercase tracking-wider">Optimized Profiles</span>
          </div>
          <div className="text-4xl font-light">
            {audits.filter(a => a.analysis.gmbOptimized).length}
          </div>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-gray-400 mb-4">
            <ExternalLink size={18} />
            <span className="text-xs font-medium uppercase tracking-wider">Est. Value Generated</span>
          </div>
          <div className="text-4xl font-light">
            ${audits.length * 150}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-bottom border-gray-50">
          <h2 className="text-lg font-medium">Recent Reports</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {audits.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No audits yet. Start by creating your first SEO report.
            </div>
          ) : (
            audits.map(audit => (
              <div key={audit.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${audit.analysis.seoScore > 80 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                    <span className="font-medium">{audit.analysis.seoScore}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{audit.business.name}</h3>
                    <p className="text-sm text-gray-500">{audit.business.category} • {new Date(audit.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setSelectedAudit(audit); setView('report'); }}
                    className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-xl border border-transparent hover:border-gray-100 transition-all"
                  >
                    <ArrowRight size={18} />
                  </button>
                  <button 
                    onClick={() => deleteAudit(audit.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderAuditForm = () => (
    <div className="max-w-2xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-light tracking-tight">New SEO Audit</h1>
        <p className="text-gray-500">Provide business details for a comprehensive AI analysis.</p>
      </div>

      <form onSubmit={handleCreateAudit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Business Name</label>
            <input 
              required
              type="text"
              value={newBusiness.name}
              onChange={e => setNewBusiness({ ...newBusiness, name: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              placeholder="e.g. Joe's Coffee"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Category</label>
            <input 
              required
              type="text"
              value={newBusiness.category}
              onChange={e => setNewBusiness({ ...newBusiness, category: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              placeholder="e.g. Coffee Shop"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Location</label>
          <input 
            required
            type="text"
            value={newBusiness.location}
            onChange={e => setNewBusiness({ ...newBusiness, location: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            placeholder="e.g. Austin, TX"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Website (Optional)</label>
          <input 
            type="url"
            value={newBusiness.website}
            onChange={e => setNewBusiness({ ...newBusiness, website: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            placeholder="https://joescoffee.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Current Description (Optional)</label>
          <textarea 
            rows={3}
            value={newBusiness.description}
            onChange={e => setNewBusiness({ ...newBusiness, description: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none"
            placeholder="Tell us about the business..."
          />
        </div>

        <button 
          disabled={isAnalyzing}
          type="submit"
          className="w-full py-4 bg-black text-white rounded-2xl hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Analyzing with AI...</span>
            </>
          ) : (
            <>
              <Zap size={20} />
              <span>Generate SEO Report</span>
            </>
          )}
        </button>
      </form>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-2xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-light tracking-tight">White-Label Settings</h1>
        <p className="text-gray-500">Customize the app to match your agency branding.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Globe size={14} /> Brand Name
            </label>
            <input 
              type="text"
              value={settings.brandName}
              onChange={e => setSettings({ ...settings, brandName: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Mail size={14} /> Support Email
            </label>
            <input 
              type="email"
              value={settings.supportEmail}
              onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Palette size={14} /> Primary Color
            </label>
            <div className="flex gap-4">
              <input 
                type="color"
                value={settings.primaryColor}
                onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-12 h-12 rounded-xl border-none cursor-pointer"
              />
              <input 
                type="text"
                value={settings.primaryColor}
                onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                className="flex-1 px-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-2xl space-y-4">
          <h3 className="text-sm font-medium">Preview</h3>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: settings.primaryColor }}></div>
            <span className="font-semibold" style={{ color: settings.primaryColor }}>{settings.brandName}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReport = () => {
    if (!selectedAudit) return null;
    const { business, analysis } = selectedAudit;

    return (
      <div className="max-w-4xl mx-auto space-y-12 py-12 pb-24">
        <div className="flex justify-between items-start">
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors"
          >
            <ChevronRight className="rotate-180" size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Share2 size={16} />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-12 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: settings.primaryColor }}>
                <ShieldCheck size={14} /> SEO Audit Report
              </div>
              <h1 className="text-4xl font-light tracking-tight text-gray-900">{business.name}</h1>
              <p className="text-gray-500">{business.category} • {business.location}</p>
            </div>
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * analysis.seoScore) / 100}
                  className="transition-all duration-1000 ease-out"
                  style={{ color: settings.primaryColor }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-light">{analysis.seoScore}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Score</span>
              </div>
            </div>
          </div>

          <div className="p-12 space-y-16">
            {/* Recommendations */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <AlertCircle size={20} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-medium">Actionable Recommendations</h2>
              </div>
              <div className="prose prose-sm max-w-none text-gray-600">
                <Markdown>{analysis.recommendations}</Markdown>
              </div>
            </section>

            {/* Optimized Description */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <Globe size={20} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-medium">Optimized GMB Description</h2>
              </div>
              <div className="p-6 bg-gray-50 rounded-3xl text-gray-700 italic leading-relaxed">
                "{analysis.suggestedDescription}"
              </div>
            </section>

            {/* Post Ideas */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <Zap size={20} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-medium">AI Post Content Ideas</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.suggestedPosts.map((post, i) => (
                  <div key={i} className="p-6 border border-gray-100 rounded-3xl hover:border-gray-200 transition-colors">
                    <div className="text-xs font-bold text-gray-400 mb-3">POST IDEA #{i+1}</div>
                    <p className="text-sm text-gray-600 leading-relaxed">{post}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Review Responses */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-medium">AI Review Response Examples</h2>
              </div>
              <div className="space-y-4">
                {analysis.reviewResponses.map((rr, i) => (
                  <div key={i} className="p-8 border border-gray-100 rounded-[32px] space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Customer Review</div>
                        <p className="text-sm text-gray-500 italic">"{rr.review}"</p>
                      </div>
                    </div>
                    <div className="pl-12 pt-4 border-t border-gray-50">
                      <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: settings.primaryColor }}>AI Suggested Response</div>
                      <p className="text-sm text-gray-700 leading-relaxed">{rr.response}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="p-12 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold" style={{ color: settings.primaryColor }}>{settings.brandName}</span>
              <span>• Powered by LocalPulse AI</span>
            </div>
            <div className="flex items-center gap-6">
              <a href={`mailto:${settings.supportEmail}`} className="hover:text-black transition-colors">{settings.supportEmail}</a>
              <span>Generated {new Date(selectedAudit.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-gray-900 font-sans selection:bg-black selection:text-white">
      {/* Sidebar / Nav */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-gray-100 flex flex-col items-center py-8 gap-8 z-50">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/10"
          style={{ backgroundColor: settings.primaryColor }}
        >
          <Zap size={20} />
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          <button 
            onClick={() => setView('dashboard')}
            className={`p-3 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-gray-50 text-black' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} />
          </button>
          <button 
            onClick={() => setView('audit')}
            className={`p-3 rounded-2xl transition-all ${view === 'audit' ? 'bg-gray-50 text-black' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
          >
            <Search size={20} />
          </button>
        </div>

        <button 
          onClick={() => setView('settings')}
          className={`p-3 rounded-2xl transition-all ${view === 'settings' ? 'bg-gray-50 text-black' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
        >
          <Settings size={20} />
        </button>
      </nav>

      {/* Main Content */}
      <main className="pl-20 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'dashboard' && renderDashboard()}
              {view === 'audit' && renderAuditForm()}
              {view === 'settings' && renderSettings()}
              {view === 'report' && renderReport()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* White Label Branding Overlay (Optional) */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-gray-100 rounded-full shadow-sm text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <ShieldCheck size={12} />
        <span>White Label Active</span>
      </div>
    </div>
  );
}

