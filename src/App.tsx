/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Loader2,
  Users,
  FileText,
  Download,
  Copy,
  Upload,
  BarChart3,
  Target,
  TrendingUp,
  Briefcase,
  Building2,
  Phone,
  Check,
  X,
  Sparkles,
  RefreshCw,
  MoreHorizontal,
  Filter,
  Star,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { WhiteLabelSettings, BusinessInfo, AuditResult, Client, AnalysisResult } from './types';
import { analyzeBusiness } from './services/geminiService';

const DEFAULT_SETTINGS: WhiteLabelSettings = {
  brandName: 'LocalPulse AI',
  primaryColor: '#000000',
  supportEmail: 'support@localpulse.ai',
  website: 'https://localpulse.ai'
};

const DEFAULT_CLIENT: Client = {
  id: '',
  name: '',
  email: '',
  phone: '',
  company: '',
  createdAt: Date.now(),
  totalAudits: 0
};

export default function App() {
  const [settings, setSettings] = useState<WhiteLabelSettings>(() => {
    const saved = localStorage.getItem('lp_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('lp_clients');
    return saved ? JSON.parse(saved) : [];
  });
  const [audits, setAudits] = useState<AuditResult[]>(() => {
    const saved = localStorage.getItem('lp_audits');
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setView] = useState<'landing' | 'dashboard' | 'audit' | 'settings' | 'report' | 'clients' | 'bulk' | 'templates'>('landing');
  const [selectedAudit, setSelectedAudit] = useState<AuditResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [newBusiness, setNewBusiness] = useState<BusinessInfo>({
    name: '',
    category: '',
    location: '',
    website: '',
    description: '',
    phone: '',
    email: ''
  });
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [newClient, setNewClient] = useState<Partial<Client>>(DEFAULT_CLIENT);
  const [showClientModal, setShowClientModal] = useState(false);
  const [bulkBusinesses, setBulkBusinesses] = useState<string>('');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('lp_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('lp_audits', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('lp_clients', JSON.stringify(clients));
  }, [clients]);

  const generateId = () => crypto.randomUUID();

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const analysis = await analyzeBusiness(newBusiness);
      const newAudit: AuditResult = {
        id: generateId(),
        timestamp: Date.now(),
        business: { ...newBusiness, id: selectedClientId || undefined },
        analysis
      };
      setAudits([newAudit, ...audits]);
      setSelectedAudit(newAudit);
      setView('report');
      setNewBusiness({ name: '', category: '', location: '', website: '', description: '', phone: '', email: '' });
    } catch (error) {
      console.error('Audit failed:', error);
      setAnalysisError('Failed to analyze business. Please check your API key and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBulkAudit = async () => {
    setBulkProcessing(true);
    setAnalysisError(null);
    try {
      const lines = bulkBusinesses.split('\n').filter(l => l.trim());
      const newAudits: AuditResult[] = [];
      
      for (const line of lines) {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          const business: BusinessInfo = {
            name: parts[0],
            category: parts[1],
            location: parts[2],
            website: parts[3] || '',
            description: parts[4] || ''
          };
          try {
            const analysis = await analyzeBusiness(business);
            newAudits.push({
              id: generateId(),
              timestamp: Date.now(),
              business,
              analysis
            });
          } catch (e) {
            console.error('Failed to audit:', business.name, e);
          }
        }
      }
      
      setAudits([...newAudits, ...audits]);
      setView('dashboard');
      setBulkBusinesses('');
    } catch (error) {
      setAnalysisError('Bulk processing failed. Please try again.');
    } finally {
      setBulkProcessing(false);
    }
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `${selectedAudit?.business.name || 'audit'}-report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    await html2pdf().set(opt).from(element).save();
  };

  const exportToCSV = () => {
    const headers = ['Business', 'Category', 'Location', 'SEO Score', 'GMB Optimized', 'Date'];
    const rows = audits.map(a => [
      a.business.name,
      a.business.category,
      a.business.location,
      a.analysis.seoScore,
      a.analysis.gmbOptimized ? 'Yes' : 'No',
      new Date(a.timestamp).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audits.csv';
    a.click();
  };

  const exportToJSON = () => {
    const json = JSON.stringify(audits, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audits.json';
    a.click();
  };

  const addClient = () => {
    if (!newClient.name || !newClient.email) return;
    const client: Client = {
      ...newClient as Client,
      id: generateId(),
      createdAt: Date.now(),
      totalAudits: 0
    };
    setClients([...clients, client]);
    setNewClient(DEFAULT_CLIENT);
    setShowClientModal(false);
  };

  const deleteAudit = (id: string) => {
    setAudits(audits.filter(a => a.id !== id));
    if (selectedAudit?.id === id) setSelectedAudit(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Needs Work';
    return 'Critical';
  };

  const renderLanding = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: settings.primaryColor }}>
              <Zap size={20} />
            </div>
            <span className="font-semibold text-xl tracking-tight">{settings.brandName}</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setView('dashboard')} className="text-gray-600 hover:text-black font-medium">Dashboard</button>
            <button onClick={() => setView('audit')} className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all font-medium">Get Started</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center space-y-8 mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
            <Sparkles size={16} style={{ color: settings.primaryColor }} />
            AI-Powered Local SEO Audits
          </div>
          <h1 className="text-6xl font-light tracking-tight text-gray-900 leading-tight">
            Grow Your Agency with<br />
            <span className="font-semibold" style={{ color: settings.primaryColor }}>AI SEO Audits</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Generate professional, white-labeled SEO audit reports in seconds. 
            Impress clients and close more deals with AI-powered insights.
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => setView('audit')} className="px-8 py-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all text-lg font-medium flex items-center gap-2">
              <Zap size={20} />
              Create Your First Audit
            </button>
            <button onClick={() => setView('dashboard')} className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all text-lg font-medium">
              View Demo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
              <Target size={24} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI-Powered Analysis</h3>
            <p className="text-gray-500">Advanced AI analyzes hundreds of SEO factors to give you actionable insights in seconds.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
              <Briefcase size={24} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">White-Label Ready</h3>
            <p className="text-gray-500">Fully customizable with your brand. Export professional PDFs that look like your own.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
              <TrendingUp size={24} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Client Management</h3>
            <p className="text-gray-500">Organize clients, track audits, and manage all your local SEO work in one place.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-light">Recent Audit Samples</h2>
            <p className="text-gray-500 mt-2">See what your clients will receive</p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "Joe's Coffee Shop", category: 'Coffee Shop', score: 72 },
                { name: "ABC Plumbing", category: 'Plumbing Services', score: 45 },
                { name: 'Downtown Dental', category: 'Dental Clinic', score: 88 }
              ].map((demo, i) => (
                <div key={i} className="p-6 border border-gray-100 rounded-2xl flex items-center justify-between hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-semibold ${getScoreColor(demo.score)}`}>
                      {demo.score}
                    </div>
                    <div>
                      <div className="font-medium">{demo.name}</div>
                      <div className="text-sm text-gray-500">{demo.category}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-400">{getScoreLabel(demo.score)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-4">Trusted by agencies worldwide</p>
          <div className="flex justify-center gap-8 opacity-50">
            {['AgencyPro', 'LocalRank', 'SEOMaster', 'GrowthHub'].map((brand, i) => (
              <span key={i} className="text-xl font-semibold text-gray-400">{brand}</span>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white py-12 mt-20">
        <div className="max-w-6xl mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: settings.primaryColor }}>
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-medium">{settings.brandName}</span>
          </div>
          <div className="text-sm text-gray-400">
            © 2024 {settings.brandName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your local SEO audits and reports.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-all"
            >
              <Download size={18} />
              <span>Export</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden z-50">
                <button onClick={() => { exportToPDF(); setShowExportMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                  <FileText size={16} className="text-gray-400" /> Export PDF
                </button>
                <button onClick={() => { exportToCSV(); setShowExportMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                  <FileText size={16} className="text-gray-400" /> Export CSV
                </button>
                <button onClick={() => { exportToJSON(); setShowExportMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                  <FileText size={16} className="text-gray-400" /> Export JSON
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => setView('audit')}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all shadow-sm"
          >
            <Plus size={20} />
            <span>New Audit</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-gray-400 mb-4">
            <Search size={18} />
            <span className="text-xs font-medium uppercase tracking-wider">Total Audits</span>
          </div>
          <div className="text-4xl font-light">{audits.length}</div>
          <div className="text-xs text-gray-400 mt-2">All time</div>
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
          <div className="text-xs text-gray-400 mt-2">
            {audits.filter(a => a.analysis.seoScore >= 80).length} excellent
          </div>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-gray-400 mb-4">
            <CheckCircle2 size={18} />
            <span className="text-xs font-medium uppercase tracking-wider">Optimized Profiles</span>
          </div>
          <div className="text-4xl font-light">
            {audits.filter(a => a.analysis.gmbOptimized).length}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {audits.length > 0 ? Math.round(audits.filter(a => a.analysis.gmbOptimized).length / audits.length * 100) : 0}% rate
          </div>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-gray-400 mb-4">
            <Users size={18} />
            <span className="text-xs font-medium uppercase tracking-wider">Active Clients</span>
          </div>
          <div className="text-4xl font-light">{clients.length}</div>
          <div className="text-xs text-gray-400 mt-2">Total clients</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-medium">Recent Reports</h2>
            <button onClick={() => setView('audit')} className="text-sm text-gray-500 hover:text-black">View All</button>
          </div>
          <div className="divide-y divide-gray-50">
            {audits.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <FileText size={32} className="mx-auto mb-3 opacity-50" />
                <p>No audits yet. Start by creating your first SEO report.</p>
              </div>
            ) : (
              audits.slice(0, 5).map(audit => (
                <div key={audit.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => { setSelectedAudit(audit); setView('report'); }}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm ${getScoreColor(audit.analysis.seoScore)}`}>
                      {audit.analysis.seoScore}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{audit.business.name}</h3>
                      <p className="text-xs text-gray-500">{audit.business.category}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{new Date(audit.timestamp).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-medium">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <button onClick={() => setView('audit')} className="w-full p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                <Plus size={20} />
              </div>
              <div className="text-left">
                <div className="font-medium">New Audit</div>
                <div className="text-xs text-gray-500">Create a single SEO report</div>
              </div>
            </button>
            <button onClick={() => setView('bulk')} className="w-full p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-200 text-gray-700 flex items-center justify-center">
                <Upload size={20} />
              </div>
              <div className="text-left">
                <div className="font-medium">Bulk Import</div>
                <div className="text-xs text-gray-500">Process multiple businesses at once</div>
              </div>
            </button>
            <button onClick={() => setView('clients')} className="w-full p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-200 text-gray-700 flex items-center justify-center">
                <Users size={20} />
              </div>
              <div className="text-left">
                <div className="font-medium">Manage Clients</div>
                <div className="text-xs text-gray-500">Add and organize your clients</div>
              </div>
            </button>
          </div>
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

      {analysisError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
          <AlertCircle size={20} />
          <span className="text-sm">{analysisError}</span>
        </div>
      )}

      <form onSubmit={handleCreateAudit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        {clients.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Link to Client (Optional)</label>
            <select 
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            >
              <option value="">No client linked</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.company || c.email}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Business Name *</label>
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
            <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Category *</label>
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
          <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Location *</label>
          <input 
            required
            type="text"
            value={newBusiness.location}
            onChange={e => setNewBusiness({ ...newBusiness, location: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            placeholder="e.g. Austin, TX"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Phone (Optional)</label>
            <input 
              type="tel"
              value={newBusiness.phone || ''}
              onChange={e => setNewBusiness({ ...newBusiness, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              placeholder="+1 (555) 123-4567"
            />
          </div>
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

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Need to audit multiple businesses? <button onClick={() => setView('bulk')} className="text-black font-medium hover:underline">Use bulk import</button>
        </p>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="max-w-4xl mx-auto space-y-8 py-12">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight">Clients</h1>
          <p className="text-gray-500">Manage your client accounts.</p>
        </div>
        <button 
          onClick={() => setShowClientModal(true)}
          className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <Users className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No clients yet</h3>
          <p className="text-gray-500 mb-6">Add your first client to get started.</p>
          <button 
            onClick={() => setShowClientModal(true)}
            className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all"
          >
            Add First Client
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map(client => (
            <div key={client.id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-600">{client.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-500">{client.email}</p>
                    {client.company && <p className="text-sm text-gray-400">{client.company}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{client.totalAudits}</span>
                  <p className="text-xs text-gray-400 uppercase">audits</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showClientModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md space-y-6 shadow-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add New Client</h2>
              <button onClick={() => setShowClientModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text"
                  value={newClient.name}
                  onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email"
                  value={newClient.email}
                  onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company (Optional)</label>
                <input 
                  type="text"
                  value={newClient.company || ''}
                  onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="Acme Inc"
                />
              </div>
            </div>
            <button 
              onClick={() => { addClient(); setShowClientModal(false); }}
              className="w-full py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all"
            >
              Add Client
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderBulk = () => (
    <div className="max-w-4xl mx-auto space-y-8 py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight">Bulk Audit</h1>
        <p className="text-gray-500">Analyze multiple businesses at once by pasting a list.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-700">Paste businesses (one per line)</label>
          <textarea
            value={bulkBusinesses}
            onChange={e => setBulkBusinesses(e.target.value)}
            placeholder={`Business Name | Category | Location
Example Restaurant | Restaurant | New York, NY
Joe's Pizza | Restaurant | Los Angeles, CA`}
            rows={10}
            className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 font-mono text-sm"
          />
        </div>
        
        <div className="mt-6 flex gap-4">
          <button 
            onClick={handleBulkAudit}
            disabled={bulkProcessing || !bulkBusinesses.trim()}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {bulkProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
            {bulkProcessing ? 'Processing...' : 'Start Bulk Audit'}
          </button>
          <button 
            onClick={() => setBulkBusinesses('')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={() => setView('dashboard')}
          className="text-gray-500 hover:text-black transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="max-w-4xl mx-auto space-y-8 py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight">Report Templates</h1>
        <p className="text-gray-500">Customize how your SEO reports look.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border-2 border-black cursor-pointer hover:shadow-lg transition-all">
          <div className="h-32 bg-gray-50 rounded-xl mb-4 flex items-center justify-center">
            <FileText size={48} className="text-gray-400" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Standard</h3>
          <p className="text-sm text-gray-500">Clean, professional layout with all key metrics.</p>
          <div className="mt-4">
            <span className="inline-block px-3 py-1 bg-black text-white text-xs rounded-full">Active</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 cursor-pointer hover:border-gray-300 hover:shadow-lg transition-all opacity-60">
          <div className="h-32 bg-gray-50 rounded-xl mb-4 flex items-center justify-center">
            <Layout size={48} className="text-gray-400" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Executive</h3>
          <p className="text-sm text-gray-500">Detailed report with competitor analysis.</p>
          <p className="mt-4 text-xs text-gray-400">Coming Soon</p>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={() => setView('dashboard')}
          className="text-gray-500 hover:text-black transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
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
              {view === 'landing' && renderLanding()}
              {view === 'dashboard' && renderDashboard()}
              {view === 'audit' && renderAuditForm()}
              {view === 'settings' && renderSettings()}
              {view === 'report' && renderReport()}
              {view === 'clients' && renderClients()}
              {view === 'bulk' && renderBulk()}
              {view === 'templates' && renderTemplates()}
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

