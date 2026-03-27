/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Layout,
  Moon,
  Sun,
  ImagePlus,
  Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { WhiteLabelSettings, BusinessInfo, AuditResult, Client, AnalysisResult, ThemeMode, DEFAULT_WHITE_LABEL } from './types';
import { analyzeBusiness } from './services/seoService';
import { aiService } from './services/aiService';
import themeService, { ThemeColors } from './services/themeservice';

const DEFAULT_SETTINGS: WhiteLabelSettings = DEFAULT_WHITE_LABEL;

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
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
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
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [aiInitializing, setAiInitializing] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(themeService.getTheme());
  const [themeColors, setThemeColors] = useState<ThemeColors>(themeService.getColors());
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoNaturalSize, setLogoNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = themeService.subscribe((theme, colors) => {
      setCurrentTheme(theme);
      setThemeColors(colors);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    localStorage.setItem('lp_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('lp_audits', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('lp_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    if (settings.logoUrl) {
      setLogoPreview(settings.logoUrl);
    }
  }, [settings.logoUrl]);

  useEffect(() => {
    const initAI = async () => {
      setAiInitializing(true);
      try {
        await aiService.initialize();
        setAiReady(true);
      } catch (error) {
        console.error('AI initialization failed:', error);
        setAiReady(false);
      } finally {
        setAiInitializing(false);
      }
    };
    initAI();
  }, []);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoPreview(dataUrl);
      
      const img = new window.Image();
      img.onload = () => {
        const dimensions = {
          width: img.naturalWidth,
          height: img.naturalHeight
        };
        setLogoNaturalSize(dimensions);
        
        setSettings(prev => ({
          ...prev,
          logoUrl: dataUrl,
          logoDimensions: dimensions
        }));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const removeLogo = useCallback(() => {
    setLogoPreview(null);
    setLogoNaturalSize(null);
    setSettings(prev => ({
      ...prev,
      logoUrl: undefined,
      logoDimensions: undefined
    }));
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  }, []);

  const getLogoSize = useCallback(() => {
    if (!logoNaturalSize) return { width: 48, height: 48 };
    
    const maxSize = 48;
    const minSize = 24;
    const aspectRatio = logoNaturalSize.width / logoNaturalSize.height;
    
    if (aspectRatio > 1) {
      return {
        width: Math.min(Math.max(logoNaturalSize.width, minSize), maxSize),
        height: Math.min(Math.max(logoNaturalSize.height / aspectRatio, minSize / aspectRatio), maxSize / aspectRatio)
      };
    } else {
      return {
        width: Math.min(Math.max(logoNaturalSize.width * aspectRatio, minSize * aspectRatio), maxSize * aspectRatio),
        height: Math.min(Math.max(logoNaturalSize.height, minSize), maxSize)
      };
    }
  }, [logoNaturalSize]);

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
      const total = lines.length;
      
      setBulkProgress({ current: 0, total });
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
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
            const analysis = await analyzeBusiness(business, aiReady);
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
        setBulkProgress({ current: i + 1, total });
      }
      
      setAudits([...newAudits, ...audits]);
      setView('dashboard');
      setBulkBusinesses('');
    } catch (error) {
      setAnalysisError('Bulk processing failed. Please try again.');
    } finally {
      setBulkProcessing(false);
      setBulkProgress({ current: 0, total: 0 });
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
    const colors = themeService.getScoreColorClass(score);
    return { text: colors.text, bg: colors.bg };
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Needs Work';
    return 'Critical';
  };

  const getScoreColorClass = (score: number) => {
    const colors = themeService.getScoreColorClass(score);
    return `${colors.text} ${colors.bg}`;
  };

  const LogoIcon = () => {
    if (settings.logoUrl && logoPreview) {
      return (
        <img 
          src={logoPreview} 
          alt="Logo" 
          style={{ height: settings.logoHeight, width: 'auto' }}
          className="object-contain rounded-xl"
        />
      );
    }
    return (
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/10"
        style={{ backgroundColor: settings.primaryColor }}
      >
        <Zap size={20} />
      </div>
    );
  };

  const SmallLogoIcon = () => {
    if (settings.logoUrl && logoPreview) {
      const scaledHeight = Math.min(settings.logoHeight * 0.75, 48);
      return (
        <img 
          src={logoPreview} 
          alt="Logo" 
          style={{ height: scaledHeight, width: 'auto' }}
          className="object-contain rounded-lg"
        />
      );
    }
    return (
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg shadow-black/10"
        style={{ backgroundColor: settings.primaryColor }}
      >
        <Zap size={16} />
      </div>
    );
  };

  const renderLanding = () => (
    <div className="min-h-screen" style={{ background: themeService.createGradient() }}>
      <header className="glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <span className="font-semibold text-xl tracking-tight text-primary">{settings.brandName}</span>
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => themeService.toggleTheme()}
              className="p-2 rounded-xl hover:bg-secondary transition-colors text-secondary"
              aria-label="Toggle theme"
            >
              {currentTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button onClick={() => setView('dashboard')} className="text-secondary hover:text-primary font-medium transition-colors">Dashboard</button>
            <button onClick={() => setView('audit')} className="px-5 py-2 rounded-full hover:opacity-90 transition-all font-medium bg-accent text-primary">Get Started</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center space-y-8 mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium glass-card text-secondary">
            <Sparkles size={16} style={{ color: settings.primaryColor }} />
            AI-Powered Local SEO Audits
          </div>
          <h1 className="text-6xl font-light tracking-tight text-primary leading-tight">
            Grow Your Agency with<br />
            <span className="font-semibold" style={{ color: settings.primaryColor }}>AI SEO Audits</span>
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
            Generate professional, white-labeled SEO audit reports in seconds. 
            Impress clients and close more deals with AI-powered insights.
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => setView('audit')} className="px-8 py-4 rounded-2xl hover:opacity-90 transition-all text-lg font-medium flex items-center gap-2 bg-accent text-primary">
              <Zap size={20} />
              Create Your First Audit
            </button>
            <button onClick={() => setView('dashboard')} className="px-8 py-4 glass-card rounded-2xl hover:glass-hover transition-all text-lg font-medium text-secondary">
              View Demo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="glass-card p-8 rounded-3xl hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center mb-6">
              <Target size={24} className="text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-primary">AI-Powered Analysis</h3>
            <p className="text-secondary">Advanced AI analyzes hundreds of SEO factors to give you actionable insights in seconds.</p>
          </div>
          <div className="glass-card p-8 rounded-3xl hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center mb-6">
              <Briefcase size={24} className="text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-primary">White-Label Ready</h3>
            <p className="text-secondary">Fully customizable with your brand. Export professional PDFs that look like your own.</p>
          </div>
          <div className="glass-card p-8 rounded-3xl hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center mb-6">
              <TrendingUp size={24} className="text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-primary">Client Management</h3>
            <p className="text-secondary">Organize clients, track audits, and manage all your local SEO work in one place.</p>
          </div>
        </div>

        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="p-8 border-b border-theme">
            <h2 className="text-2xl font-light text-primary">Recent Audit Samples</h2>
            <p className="text-secondary mt-2">See what your clients will receive</p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "Joe's Coffee Shop", category: 'Coffee Shop', score: 72 },
                { name: "ABC Plumbing", category: 'Plumbing Services', score: 45 },
                { name: 'Downtown Dental', category: 'Dental Clinic', score: 88 }
              ].map((demo, i) => (
                <div key={i} className="p-6 border border-theme rounded-2xl flex items-center justify-between hover:border-theme-hover transition-colors glass-hover">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-semibold ${getScoreColorClass(demo.score)}`}>
                      {demo.score}
                    </div>
                    <div>
                      <div className="font-medium text-primary">{demo.name}</div>
                      <div className="text-sm text-secondary">{demo.category}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-tertiary">{getScoreLabel(demo.score)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-secondary mb-4">Trusted by agencies worldwide</p>
          <div className="flex justify-center gap-8 opacity-50">
            {['AgencyPro', 'LocalRank', 'SEOMaster', 'GrowthHub'].map((brand, i) => (
              <span key={i} className="text-xl font-semibold text-tertiary">{brand}</span>
            ))}
          </div>
        </div>
      </main>

      <footer className="glass py-12 mt-20">
        <div className="max-w-6xl mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <SmallLogoIcon />
            <span className="font-medium text-primary">{settings.brandName}</span>
          </div>
          <div className="text-sm text-tertiary">
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
          <h1 className="text-3xl font-light tracking-tight text-primary">Dashboard</h1>
          <p className="text-secondary mt-1">Manage your local SEO audits and reports.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-3 glass-card rounded-full hover:glass-hover transition-all"
            >
              <Download size={18} className="text-secondary" />
              <span className="text-secondary">Export</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 glass-modal rounded-2xl overflow-hidden z-50">
                <button onClick={() => { exportToPDF(); setShowExportMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-secondary flex items-center gap-3 text-primary transition-colors">
                  <FileText size={16} className="text-tertiary" /> Export PDF
                </button>
                <button onClick={() => { exportToCSV(); setShowExportMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-secondary flex items-center gap-3 text-primary transition-colors">
                  <FileText size={16} className="text-tertiary" /> Export CSV
                </button>
                <button onClick={() => { exportToJSON(); setShowExportMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-secondary flex items-center gap-3 text-primary transition-colors">
                  <FileText size={16} className="text-tertiary" /> Export JSON
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => setView('audit')}
            className="flex items-center gap-2 px-6 py-3 rounded-full hover:opacity-90 transition-all shadow-sm bg-accent text-primary"
          >
            <Plus size={20} />
            <span>New Audit</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-3 text-tertiary mb-4">
            <Search size={18} />
            <span className="text-xs font-medium uppercase tracking-wider">Total Audits</span>
          </div>
          <div className="text-4xl font-light text-primary">{audits.length}</div>
          <div className="text-xs text-tertiary mt-2">All time</div>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-3 text-tertiary mb-4">
            <ShieldCheck size={18} />
            <span className="text-xs font-medium uppercase tracking-wider">Avg. SEO Score</span>
          </div>
          <div className="text-4xl font-light text-primary">
            {audits.length > 0 
              ? Math.round(audits.reduce((acc, a) => acc + a.analysis.seoScore, 0) / audits.length)
              : 0}%
          </div>
          <div className="text-xs text-tertiary mt-2">
            {audits.filter(a => a.analysis.seoScore >= 80).length} excellent
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-3 text-tertiary mb-4">
            <CheckCircle2 size={18} />
            <span className="text-xs font-medium uppercase tracking-wider">Optimized Profiles</span>
          </div>
          <div className="text-4xl font-light text-primary">
            {audits.filter(a => a.analysis.gmbOptimized).length}
          </div>
          <div className="text-xs text-tertiary mt-2">
            {audits.length > 0 ? Math.round(audits.filter(a => a.analysis.gmbOptimized).length / audits.length * 100) : 0}% rate
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-3 text-tertiary mb-4">
            <Users size={18} />
            <span className="text-xs font-medium uppercase tracking-wider">Active Clients</span>
          </div>
          <div className="text-4xl font-light text-primary">{clients.length}</div>
          <div className="text-xs text-tertiary mt-2">Total clients</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-theme flex justify-between items-center">
            <h2 className="text-lg font-medium text-primary">Recent Reports</h2>
            <button onClick={() => setView('audit')} className="text-sm text-secondary hover:text-primary transition-colors">View All</button>
          </div>
          <div className="divide-y divide-border">
            {audits.length === 0 ? (
              <div className="p-8 text-center text-tertiary">
                <FileText size={32} className="mx-auto mb-3 opacity-50" />
                <p>No audits yet. Start by creating your first SEO report.</p>
              </div>
            ) : (
              audits.slice(0, 5).map(audit => (
                <div key={audit.id} className="p-4 flex items-center justify-between hover:bg-secondary transition-colors group cursor-pointer" onClick={() => { setSelectedAudit(audit); setView('report'); }}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm ${getScoreColorClass(audit.analysis.seoScore)}`}>
                      {audit.analysis.seoScore}
                    </div>
                    <div>
                      <h3 className="font-medium text-primary text-sm">{audit.business.name}</h3>
                      <p className="text-xs text-secondary">{audit.business.category}</p>
                    </div>
                  </div>
                  <div className="text-xs text-tertiary">{new Date(audit.timestamp).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-theme flex justify-between items-center">
            <h2 className="text-lg font-medium text-primary">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <button onClick={() => setView('audit')} className="w-full p-4 rounded-2xl hover:bg-secondary transition-colors flex items-center gap-4 glass-hover">
              <div className="w-10 h-10 rounded-xl bg-accent text-primary flex items-center justify-center">
                <Plus size={20} />
              </div>
              <div className="text-left">
                <div className="font-medium text-primary">New Audit</div>
                <div className="text-xs text-secondary">Create a single SEO report</div>
              </div>
            </button>
            <button onClick={() => setView('bulk')} className="w-full p-4 rounded-2xl hover:bg-secondary transition-colors flex items-center gap-4 glass-hover">
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                <Upload size={20} className="text-secondary" />
              </div>
              <div className="text-left">
                <div className="font-medium text-primary">Bulk Import</div>
                <div className="text-xs text-secondary">Process multiple businesses at once</div>
              </div>
            </button>
            <button onClick={() => setView('clients')} className="w-full p-4 rounded-2xl hover:bg-secondary transition-colors flex items-center gap-4 glass-hover">
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                <Users size={20} className="text-secondary" />
              </div>
              <div className="text-left">
                <div className="font-medium text-primary">Manage Clients</div>
                <div className="text-xs text-secondary">Add and organize your clients</div>
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
        <h1 className="text-3xl font-light tracking-tight text-primary">New SEO Audit</h1>
        <p className="text-secondary">Provide business details for a comprehensive AI analysis.</p>
      </div>

      {analysisError && (
        <div className="p-4 glass-card rounded-2xl flex items-center gap-3 text-error">
          <AlertCircle size={20} />
          <span className="text-sm">{analysisError}</span>
        </div>
      )}

      <form onSubmit={handleCreateAudit} className="glass-card p-8 rounded-3xl space-y-6">
        <div className={`flex items-center gap-2 p-3 rounded-xl ${aiReady ? 'bg-success/10' : 'bg-warning/10'}`}>
          <div className={`w-2 h-2 rounded-full ${aiReady ? 'bg-success' : 'bg-warning'} animate-pulse`} />
          <span className="text-xs text-secondary">
            {aiInitializing ? 'Initializing AI engine...' : aiReady ? 'AI engine ready - Using local AI for intelligent SEO analysis' : 'AI not available - Using rule-based analysis'}
          </span>
        </div>

        {clients.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-secondary">Link to Client (Optional)</label>
            <select 
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl glass-input text-primary"
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
            <label className="text-xs font-medium uppercase tracking-wider text-secondary">Business Name *</label>
            <input 
              required
              type="text"
              value={newBusiness.name}
              onChange={e => setNewBusiness({ ...newBusiness, name: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl glass-input text-primary"
              placeholder="e.g. Joe's Coffee"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-secondary">Category *</label>
            <input 
              required
              type="text"
              value={newBusiness.category}
              onChange={e => setNewBusiness({ ...newBusiness, category: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl glass-input text-primary"
              placeholder="e.g. Coffee Shop"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-secondary">Location *</label>
          <input 
            required
            type="text"
            value={newBusiness.location}
            onChange={e => setNewBusiness({ ...newBusiness, location: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl glass-input text-primary"
            placeholder="e.g. Austin, TX"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-secondary">Website (Optional)</label>
            <input 
              type="url"
              value={newBusiness.website}
              onChange={e => setNewBusiness({ ...newBusiness, website: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl glass-input text-primary"
              placeholder="https://joescoffee.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-secondary">Phone (Optional)</label>
            <input 
              type="tel"
              value={newBusiness.phone || ''}
              onChange={e => setNewBusiness({ ...newBusiness, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl glass-input text-primary"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-secondary">Current Description (Optional)</label>
          <textarea 
            rows={3}
            value={newBusiness.description}
            onChange={e => setNewBusiness({ ...newBusiness, description: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl glass-input text-primary resize-none"
            placeholder="Tell us about the business..."
          />
        </div>

        <button 
          disabled={isAnalyzing}
          type="submit"
          className="w-full py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
          style={{ backgroundColor: settings.primaryColor, color: settings.colors.text }}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>{aiReady ? 'Scraping website & analyzing with AI...' : 'Scraping website & analyzing...'}</span>
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
        <p className="text-sm text-secondary">
          Need to audit multiple businesses? <button onClick={() => setView('bulk')} className="font-medium hover:underline text-primary">Use bulk import</button>
        </p>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="max-w-4xl mx-auto space-y-8 py-12">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight text-primary">Clients</h1>
          <p className="text-secondary">Manage your client accounts.</p>
        </div>
        <button 
          onClick={() => setShowClientModal(true)}
          className="px-5 py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 bg-accent text-primary"
        >
          <Plus size={18} />
          Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl">
          <Users className="mx-auto text-tertiary mb-4" size={48} />
          <h3 className="text-lg font-medium text-secondary mb-2">No clients yet</h3>
          <p className="text-secondary mb-6">Add your first client to get started.</p>
          <button 
            onClick={() => setShowClientModal(true)}
            className="px-6 py-2.5 rounded-xl hover:opacity-90 transition-all bg-accent text-primary"
          >
            Add First Client
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map(client => (
            <div key={client.id} className="glass-card p-6 rounded-2xl hover:glass-hover transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">{client.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">{client.name}</h3>
                    <p className="text-sm text-secondary">{client.email}</p>
                    {client.company && <p className="text-sm text-tertiary">{client.company}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary">{client.totalAudits}</span>
                  <p className="text-xs text-tertiary uppercase">audits</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showClientModal && (
        <div className="fixed inset-0 glass-blur-overlay flex items-center justify-center z-50 p-4">
          <div className="glass-modal rounded-3xl p-8 w-full max-w-md space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-primary">Add New Client</h2>
              <button onClick={() => setShowClientModal(false)} className="text-tertiary hover:text-primary transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Name</label>
                <input 
                  type="text"
                  value={newClient.name}
                  onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-primary"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Email</label>
                <input 
                  type="email"
                  value={newClient.email}
                  onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-primary"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Company (Optional)</label>
                <input 
                  type="text"
                  value={newClient.company || ''}
                  onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-primary"
                  placeholder="Acme Inc"
                />
              </div>
            </div>
            <button 
              onClick={() => { addClient(); setShowClientModal(false); }}
              className="w-full py-3 rounded-xl hover:opacity-90 transition-all bg-accent text-primary"
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
        <h1 className="text-3xl font-light tracking-tight text-primary">Bulk Audit</h1>
        <p className="text-secondary">Analyze multiple businesses at once by pasting a list.</p>
      </div>

      <div className="glass-card p-8 rounded-3xl">
        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-secondary">
          <div className={`w-2 h-2 rounded-full ${aiReady ? 'bg-success' : 'bg-warning'} animate-pulse`} />
          <span className="text-xs text-secondary">
            {aiInitializing ? 'Initializing AI engine...' : aiReady ? 'AI engine ready - Using local AI for intelligent analysis' : 'AI not available - Using rule-based analysis'}
          </span>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium text-secondary">Paste businesses (one per line)</label>
          <textarea
            value={bulkBusinesses}
            onChange={e => setBulkBusinesses(e.target.value)}
            placeholder={`Business Name, Category, Location, Website (optional)
Joe's Coffee, Coffee Shop, Austin TX, https://joescoffee.com
ABC Plumbing, Plumbing, Dallas TX
Downtown Dental, Dentist, Houston TX, https://downtowndental.com`}
            rows={10}
            className="w-full px-4 py-3 rounded-2xl glass-input text-primary font-mono text-sm"
          />
        </div>
        
        {bulkProcessing && bulkProgress.total > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-secondary">
              <span>Processing {bulkProgress.current} of {bulkProgress.total}...</span>
              <span>{Math.round((bulkProgress.current / bulkProgress.total) * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${(bulkProgress.current / bulkProgress.total) * 100}%`,
                  backgroundColor: settings.primaryColor 
                }}
              />
            </div>
          </div>
        )}
        
        <div className="mt-6 flex gap-4">
          <button 
            onClick={handleBulkAudit}
            disabled={bulkProcessing || !bulkBusinesses.trim()}
            className="px-6 py-3 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            style={{ backgroundColor: settings.primaryColor, color: settings.colors.text }}
          >
            {bulkProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
            {bulkProcessing ? 'Processing...' : 'Start Bulk Audit'}
          </button>
          <button 
            onClick={() => setBulkBusinesses('')}
            className="px-6 py-3 glass-card rounded-xl hover:glass-hover transition-all text-secondary"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={() => setView('dashboard')}
          className="text-secondary hover:text-primary transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="max-w-4xl mx-auto space-y-8 py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight text-primary">Report Templates</h1>
        <p className="text-secondary">Customize how your SEO reports look.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-8 rounded-3xl border-2 cursor-pointer hover:scale-[1.02] transition-all border-primary">
          <div className="h-32 glass rounded-xl mb-4 flex items-center justify-center">
            <FileText size={48} className="text-secondary" />
          </div>
          <h3 className="font-semibold text-lg mb-1 text-primary">Standard</h3>
          <p className="text-sm text-secondary">Clean, professional layout with all key metrics.</p>
          <div className="mt-4">
            <span className="inline-block px-3 py-1 bg-accent text-primary text-xs rounded-full">Active</span>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl cursor-pointer hover:glass-hover transition-all opacity-60">
          <div className="h-32 glass rounded-xl mb-4 flex items-center justify-center">
            <Layout size={48} className="text-secondary" />
          </div>
          <h3 className="font-semibold text-lg mb-1 text-primary">Executive</h3>
          <p className="text-sm text-secondary">Detailed report with competitor analysis.</p>
          <p className="mt-4 text-xs text-tertiary">Coming Soon</p>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={() => setView('dashboard')}
          className="text-secondary hover:text-primary transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-4xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-light tracking-tight text-primary">White-Label Settings</h1>
        <p className="text-secondary">Customize the app to match your agency branding.</p>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-8 rounded-3xl space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <ImagePlus size={18} /> Brand Identity
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary">Logo Upload</label>
              <div className="space-y-4">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label 
                  htmlFor="logo-upload"
                  className="glass-logo-container rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[120px] hover:scale-[1.02]"
                >
                  {logoPreview ? (
                    <div className="relative group">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="logo-preview max-h-20"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-secondary bg-secondary/80 px-2 py-1 rounded">Change</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} className="text-tertiary mb-3" />
                      <span className="text-sm text-secondary">Click to upload logo</span>
                      <span className="text-xs text-tertiary mt-1">PNG, JPG, SVG up to 2MB</span>
                    </>
                  )}
                </label>
                {logoPreview && (
                  <button
                    onClick={removeLogo}
                    className="flex items-center gap-2 text-sm text-error hover:opacity-80 transition-opacity"
                  >
                    <Trash size={14} />
                    Remove logo
                  </button>
                )}
                {logoNaturalSize && (
                  <p className="text-xs text-tertiary">
                    Original size: {logoNaturalSize.width} × {logoNaturalSize.height}px
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-secondary flex items-center gap-2">
                  <Globe size={14} /> Brand Name
                </label>
                <input 
                  type="text"
                  value={settings.brandName}
                  onChange={e => setSettings({ ...settings, brandName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl glass-input text-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-secondary flex items-center gap-2">
                  <Mail size={14} /> Support Email
                </label>
                <input 
                  type="email"
                  value={settings.supportEmail}
                  onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl glass-input text-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-secondary flex items-center gap-2">
                  <Globe size={14} /> Website URL
                </label>
                <input 
                  type="url"
                  value={settings.website || ''}
                  onChange={e => setSettings({ ...settings, website: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl glass-input text-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl space-y-8">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Palette size={18} /> Colors & Theme
          </h2>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary">Base Theme</label>
              <div className="flex gap-3">
                <button
                  onClick={() => { themeService.setTheme('light'); setSettings({ ...settings, theme: 'light' }); }}
                  className={`flex-1 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    settings.theme === 'light' 
                      ? 'bg-accent text-primary' 
                      : 'glass-card hover:glass-hover text-secondary'
                  }`}
                >
                  <Sun size={18} />
                  Light
                </button>
                <button
                  onClick={() => { themeService.setTheme('dark'); setSettings({ ...settings, theme: 'dark' }); }}
                  className={`flex-1 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    settings.theme === 'dark' 
                      ? 'bg-accent text-primary' 
                      : 'glass-card hover:glass-hover text-secondary'
                  }`}
                >
                  <Moon size={18} />
                  Dark
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary">Primary Color</label>
              <p className="text-xs text-tertiary">This color will be used for buttons, links, and accent elements.</p>
              <div className="flex gap-4 items-center">
                <input 
                  type="color"
                  value={settings.primaryColor}
                  onChange={e => {
                    setSettings({ ...settings, primaryColor: e.target.value });
                    themeService.applyCustomColors({ ...settings, primaryColor: e.target.value });
                  }}
                  className="w-16 h-16 rounded-xl border-none cursor-pointer"
                />
                <input 
                  type="text"
                  value={settings.primaryColor}
                  onChange={e => {
                    setSettings({ ...settings, primaryColor: e.target.value });
                    themeService.applyCustomColors({ ...settings, primaryColor: e.target.value });
                  }}
                  className="flex-1 px-4 py-3 rounded-2xl glass-input text-primary"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {['#000000', '#1A56DB', '#059669', '#7C3AED', '#DB2777', '#EA580C', '#0891B2', '#4F46E5'].map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      setSettings({ ...settings, primaryColor: color });
                      themeService.applyCustomColors({ ...settings, primaryColor: color });
                    }}
                    className="w-10 h-10 rounded-lg border-2 transition-all"
                    style={{ 
                      backgroundColor: color,
                      borderColor: settings.primaryColor === color ? 'var(--accent)' : 'transparent'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-medium uppercase tracking-wider text-secondary">Card Background</label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="color"
                    value={settings.colors.surface.slice(0, 7)}
                    onChange={e => setSettings({ 
                      ...settings, 
                      colors: { ...settings.colors, surface: e.target.value }
                    })}
                    className="w-12 h-12 rounded-xl border-none cursor-pointer"
                  />
                  <input 
                    type="text"
                    value={settings.colors.surface}
                    onChange={e => setSettings({ 
                      ...settings, 
                      colors: { ...settings.colors, surface: e.target.value }
                    })}
                    className="flex-1 px-4 py-2 rounded-xl glass-input text-primary text-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium uppercase tracking-wider text-secondary">Border Color</label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="color"
                    value={settings.colors.border.match(/\d+/g)?.slice(0, 3).join(',').split(',').length === 3 ? '#333' : settings.colors.border.slice(0, 7)}
                    onChange={e => {
                      const alpha = settings.colors.border.includes('rgba') ? 
                        settings.colors.border.match(/[\d.]+\)$/)?.[0] : '0.08)';
                      setSettings({ 
                        ...settings, 
                        colors: { ...settings.colors, border: `${e.target.value}${alpha}` }
                      });
                    }}
                    className="w-12 h-12 rounded-xl border-none cursor-pointer"
                  />
                  <input 
                    type="text"
                    value={settings.colors.border}
                    onChange={e => setSettings({ 
                      ...settings, 
                      colors: { ...settings.colors, border: e.target.value }
                    })}
                    className="flex-1 px-4 py-2 rounded-xl glass-input text-primary text-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium uppercase tracking-wider text-secondary">Primary Text</label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="color"
                    value={settings.colors.text.slice(0, 7)}
                    onChange={e => setSettings({ 
                      ...settings, 
                      colors: { ...settings.colors, text: e.target.value }
                    })}
                    className="w-12 h-12 rounded-xl border-none cursor-pointer"
                  />
                  <input 
                    type="text"
                    value={settings.colors.text}
                    onChange={e => setSettings({ 
                      ...settings, 
                      colors: { ...settings.colors, text: e.target.value }
                    })}
                    className="flex-1 px-4 py-2 rounded-xl glass-input text-primary text-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium uppercase tracking-wider text-secondary">Secondary Text</label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="color"
                    value={settings.colors.textSecondary.slice(0, 7)}
                    onChange={e => setSettings({ 
                      ...settings, 
                      colors: { ...settings.colors, textSecondary: e.target.value }
                    })}
                    className="w-12 h-12 rounded-xl border-none cursor-pointer"
                  />
                  <input 
                    type="text"
                    value={settings.colors.textSecondary}
                    onChange={e => setSettings({ 
                      ...settings, 
                      colors: { ...settings.colors, textSecondary: e.target.value }
                    })}
                    className="flex-1 px-4 py-2 rounded-xl glass-input text-primary text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary">Status Colors</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: settings.colors.success }} />
                    <span className="text-xs text-secondary">Success</span>
                  </div>
                  <input 
                    type="color"
                    value={settings.colors.success}
                    onChange={e => setSettings({ 
                      ...settings, 
                      colors: { ...settings.colors, success: e.target.value }
                    })}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: settings.colors.warning }} />
                    <span className="text-xs text-secondary">Warning</span>
                  </div>
                  <input 
                    type="color"
                    value={settings.colors.warning}
                    onChange={e => setSettings({ 
                      ...settings, 
                      colors: { ...settings.colors, warning: e.target.value }
                    })}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: settings.colors.error }} />
                    <span className="text-xs text-secondary">Error</span>
                  </div>
                  <input 
                    type="color"
                    value={settings.colors.error}
                    onChange={e => setSettings({ 
                      ...settings, 
                      colors: { ...settings.colors, error: e.target.value }
                    })}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl space-y-8">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Layout size={18} /> Typography
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary">Heading Font</label>
              <select 
                value={settings.fonts.headingFont}
                onChange={e => setSettings({ ...settings, fonts: { ...settings.fonts, headingFont: e.target.value } })}
                className="w-full px-4 py-3 rounded-2xl glass-input text-primary"
              >
                <option value="Inter">Inter</option>
                <option value="Poppins">Poppins</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Raleway">Raleway</option>
                <option value="Oswald">Oswald</option>
                <option value="Roboto Slab">Roboto Slab</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary">Body Font</label>
              <select 
                value={settings.fonts.bodyFont}
                onChange={e => setSettings({ ...settings, fonts: { ...settings.fonts, bodyFont: e.target.value } })}
                className="w-full px-4 py-3 rounded-2xl glass-input text-primary"
              >
                <option value="Inter">Inter</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Source Sans Pro">Source Sans Pro</option>
                <option value="Nunito">Nunito</option>
                <option value="Work Sans">Work Sans</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary">Heading Weight</label>
              <input 
                type="range"
                min="300"
                max="900"
                step="100"
                value={settings.fonts.headingWeight}
                onChange={e => setSettings({ ...settings, fonts: { ...settings.fonts, headingWeight: parseInt(e.target.value) } })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-tertiary">
                <span>Light (300)</span>
                <span className="font-semibold text-primary">{settings.fonts.headingWeight}</span>
                <span>Bold (900)</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary">Logo Height</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range"
                  min="24"
                  max="80"
                  value={settings.logoHeight}
                  onChange={e => setSettings({ ...settings, logoHeight: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-primary w-12 text-right">{settings.logoHeight}px</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl space-y-8">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Layout size={18} /> Layout & Spacing
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary">Corner Radius</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary">Small</span>
                  <input 
                    type="text"
                    value={settings.borderRadius.small}
                    onChange={e => setSettings({ ...settings, borderRadius: { ...settings.borderRadius, small: e.target.value } })}
                    className="w-20 px-2 py-1 rounded glass-input text-primary text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary">Medium</span>
                  <input 
                    type="text"
                    value={settings.borderRadius.medium}
                    onChange={e => setSettings({ ...settings, borderRadius: { ...settings.borderRadius, medium: e.target.value } })}
                    className="w-20 px-2 py-1 rounded glass-input text-primary text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary">Large</span>
                  <input 
                    type="text"
                    value={settings.borderRadius.large}
                    onChange={e => setSettings({ ...settings, borderRadius: { ...settings.borderRadius, large: e.target.value } })}
                    className="w-20 px-2 py-1 rounded glass-input text-primary text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary">Preset Styles</label>
              <div className="space-y-2">
                <button 
                  onClick={() => setSettings({ 
                    ...settings, 
                    borderRadius: { small: '4px', medium: '8px', large: '12px', full: '9999px' }
                  })}
                  className="w-full px-3 py-2 rounded-lg text-xs glass-card hover:glass-hover text-secondary transition-all"
                >
                  Sharp
                </button>
                <button 
                  onClick={() => setSettings({ 
                    ...settings, 
                    borderRadius: { small: '8px', medium: '16px', large: '24px', full: '9999px' }
                  })}
                  className="w-full px-3 py-2 rounded-lg text-xs glass-card hover:glass-hover text-secondary transition-all"
                >
                  Rounded
                </button>
                <button 
                  onClick={() => setSettings({ 
                    ...settings, 
                    borderRadius: { small: '16px', medium: '24px', large: '32px', full: '9999px' }
                  })}
                  className="w-full px-3 py-2 rounded-lg text-xs glass-card hover:glass-hover text-secondary transition-all"
                >
                  Pill
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary">Options</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={settings.showWatermark}
                    onChange={e => setSettings({ ...settings, showWatermark: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm text-secondary">Show "Powered by" watermark</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl space-y-8">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <BarChart3 size={18} /> Preview
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 glass-card rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <SmallLogoIcon />
                <span className="font-semibold text-primary">{settings.brandName}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-tertiary">Primary:</span>
                  <div 
                    className="w-5 h-5 rounded" 
                    style={{ backgroundColor: settings.primaryColor }}
                  />
                  <span className="text-xs text-tertiary">{settings.primaryColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-tertiary">Text:</span>
                  <span className="text-xs text-primary">{settings.colors.text}</span>
                </div>
              </div>
              <button 
                className="w-full py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor: settings.primaryColor, color: settings.colors.text }}
              >
                Sample Button
              </button>
            </div>

            <div className="p-6 glass-card rounded-2xl space-y-3">
              <div className="text-xs font-medium text-secondary">Card Preview</div>
              <div 
                className="h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: settings.colors.surface }}
              >
                <span className="text-xs" style={{ color: settings.colors.textSecondary }}>Surface</span>
              </div>
              <div 
                className="h-16 rounded-xl border flex items-center justify-center"
                style={{ borderColor: settings.colors.border }}
              >
                <span className="text-xs" style={{ color: settings.colors.textMuted }}>With Border</span>
              </div>
            </div>

            <div className="p-6 glass-card rounded-2xl space-y-3">
              <div className="text-xs font-medium text-secondary">Status Colors</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div 
                    className="h-8 rounded-lg mb-1" 
                    style={{ backgroundColor: settings.colors.success }}
                  />
                  <span className="text-xs" style={{ color: settings.colors.textMuted }}>Success</span>
                </div>
                <div className="text-center">
                  <div 
                    className="h-8 rounded-lg mb-1" 
                    style={{ backgroundColor: settings.colors.warning }}
                  />
                  <span className="text-xs" style={{ color: settings.colors.textMuted }}>Warning</span>
                </div>
                <div className="text-center">
                  <div 
                    className="h-8 rounded-lg mb-1" 
                    style={{ backgroundColor: settings.colors.error }}
                  />
                  <span className="text-xs" style={{ color: settings.colors.textMuted }}>Error</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            onClick={() => setSettings(DEFAULT_SETTINGS)}
            className="px-6 py-3 glass-card rounded-xl hover:glass-hover transition-all text-secondary"
          >
            Reset to Defaults
          </button>
          <button
            onClick={() => {
              themeService.applyCustomColors(settings);
              localStorage.setItem('lp_settings', JSON.stringify(settings));
            }}
            className="px-6 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
            style={{ backgroundColor: settings.primaryColor, color: settings.colors.text }}
          >
            <Check size={18} />
            Save Settings
          </button>
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
            className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
          >
            <ChevronRight className="rotate-180" size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 glass-card rounded-xl hover:glass-hover transition-all flex items-center gap-2 text-secondary"
            >
              <Share2 size={16} />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        <div className="glass-card rounded-[40px] overflow-hidden">
          <div className="p-12 bg-secondary border-b border-theme flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                <ShieldCheck size={14} style={{ color: settings.primaryColor }} /> SEO Audit Report
              </div>
              <h1 className="text-4xl font-light tracking-tight text-primary">{business.name}</h1>
              <p className="text-secondary">{business.category} • {business.location}</p>
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
                  className="text-tertiary"
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
                <span className="text-3xl font-light text-primary">{analysis.seoScore}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">Score</span>
              </div>
            </div>
          </div>

          <div className="p-12 space-y-16">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                  <AlertCircle size={20} className="text-secondary" />
                </div>
                <h2 className="text-xl font-medium text-primary">Actionable Recommendations</h2>
              </div>
              <div className="prose prose-sm max-w-none text-secondary">
                <Markdown>{analysis.recommendations}</Markdown>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                  <Globe size={20} className="text-secondary" />
                </div>
                <h2 className="text-xl font-medium text-primary">Optimized GMB Description</h2>
              </div>
              <div className="p-6 glass rounded-3xl text-secondary italic leading-relaxed">
                "{analysis.suggestedDescription}"
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                  <Zap size={20} className="text-secondary" />
                </div>
                <h2 className="text-xl font-medium text-primary">AI Post Content Ideas</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.suggestedPosts.map((post, i) => (
                  <div key={i} className="p-6 border border-theme rounded-3xl hover:border-theme-hover transition-colors glass-hover">
                    <div className="text-xs font-bold text-tertiary mb-3">POST IDEA #{i+1}</div>
                    <p className="text-sm text-secondary leading-relaxed">{post}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                  <Mail size={20} className="text-secondary" />
                </div>
                <h2 className="text-xl font-medium text-primary">AI Review Response Examples</h2>
              </div>
              <div className="space-y-4">
                {analysis.reviewResponses.map((rr, i) => (
                  <div key={i} className="p-8 border border-theme rounded-[32px] space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full glass flex-shrink-0" />
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-primary">Customer Review</div>
                        <p className="text-sm text-secondary italic">"{rr.review}"</p>
                      </div>
                    </div>
                    <div className="pl-12 pt-4 border-t border-theme">
                      <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: settings.primaryColor }}>AI Suggested Response</div>
                      <p className="text-sm text-secondary leading-relaxed">{rr.response}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="p-12 bg-secondary border-t border-theme flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-tertiary">
            <div className="flex items-center gap-2">
              <span className="font-semibold" style={{ color: settings.primaryColor }}>{settings.brandName}</span>
            </div>
            <div className="flex items-center gap-6">
              <a href={`mailto:${settings.supportEmail}`} className="hover:text-primary transition-colors">{settings.supportEmail}</a>
              <span>Generated {new Date(selectedAudit.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen scrollbar-glass" style={{ background: themeService.createGradient() }}>
      <nav className="glass-sidebar fixed left-0 top-0 bottom-0 w-20 flex flex-col items-center py-8 gap-8 z-50">
        <LogoIcon />
        
        <div className="flex-1 flex flex-col gap-4">
          <button 
            onClick={() => setView('dashboard')}
            className={`p-3 rounded-2xl transition-all ${view === 'dashboard' ? 'glass text-primary' : 'text-tertiary hover:text-primary hover:glass'}`}
          >
            <LayoutDashboard size={20} />
          </button>
          <button 
            onClick={() => setView('audit')}
            className={`p-3 rounded-2xl transition-all ${view === 'audit' ? 'glass text-primary' : 'text-tertiary hover:text-primary hover:glass'}`}
          >
            <Search size={20} />
          </button>
        </div>

        <button 
          onClick={() => setView('settings')}
          className={`p-3 rounded-2xl transition-all ${view === 'settings' ? 'glass text-primary' : 'text-tertiary hover:text-primary hover:glass'}`}
        >
          <Settings size={20} />
        </button>
      </nav>

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

      <div className="fixed bottom-6 right-6 flex items-center gap-2 glass rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-tertiary">
        <ShieldCheck size={12} />
        <span>White Label Active</span>
      </div>
    </div>
  );
}
