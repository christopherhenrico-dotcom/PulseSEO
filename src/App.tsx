/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard,
  Search,
  Settings as SettingsIcon,
  Users as UsersIcon,
  Upload as UploadIcon,
  FileText as FileTextIcon,
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { WhiteLabelSettings, BusinessInfo, AuditResult, Client, ThemeMode, DEFAULT_WHITE_LABEL } from './types';
import { analyzeBusiness } from './services/seoService';
import { aiService } from './services/aiService';
import themeService from './services/themeservice';

import { MainLayout } from './components/layout';
import { LandingPage } from './components/views/landing';
import { Dashboard } from './components/views/dashboard';
import { AuditForm } from './components/views/audit';
import { Settings } from './components/views/settings';
import { Report } from './components/views/report';
import { Clients } from './components/views/clients';
import { BulkAudit } from './components/views/bulk';
import { Templates } from './components/views/templates';

const DEFAULT_CLIENT: Client = {
  id: '',
  name: '',
  email: '',
  phone: '',
  company: '',
  createdAt: Date.now(),
  totalAudits: 0,
};

export default function App() {
  const [settings, setSettings] = useState<WhiteLabelSettings>(() => {
    const saved = localStorage.getItem('lp_settings');
    if (saved) {
      try {
        return { ...DEFAULT_WHITE_LABEL, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_WHITE_LABEL;
      }
    }
    return DEFAULT_WHITE_LABEL;
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
  const [newBusiness, setNewBusiness] = useState<BusinessInfo>({ name: '', category: '', location: '', website: '', description: '', phone: '', email: '' });
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [newClient, setNewClient] = useState<Partial<Client>>(DEFAULT_CLIENT);
  const [bulkBusinesses, setBulkBusinesses] = useState<string>('');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [aiReady, setAiReady] = useState(false);
  const [aiInitializing, setAiInitializing] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(themeService.getTheme());
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoNaturalSize, setLogoNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = themeService.subscribe((theme) => {
      setCurrentTheme(theme);
    });
    themeService.applyCustomColors(settings);
    return unsubscribe;
  }, [settings]);

  useEffect(() => { localStorage.setItem('lp_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('lp_audits', JSON.stringify(audits)); }, [audits]);
  useEffect(() => { localStorage.setItem('lp_clients', JSON.stringify(clients)); }, [clients]);

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
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoPreview(dataUrl);
      const img = new window.Image();
      img.onload = () => {
        const dimensions = { width: img.naturalWidth, height: img.naturalHeight };
        setLogoNaturalSize(dimensions);
        setSettings(prev => ({ ...prev, logoUrl: dataUrl, logoDimensions: dimensions }));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const removeLogo = useCallback(() => {
    setLogoPreview(null);
    setLogoNaturalSize(null);
    setSettings(prev => ({ ...prev, logoUrl: undefined, logoDimensions: undefined }));
    if (logoInputRef.current) logoInputRef.current.value = '';
  }, []);

  const generateId = () => crypto.randomUUID();

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const analysis = await analyzeBusiness(newBusiness, aiReady);
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
      setAnalysisError('Failed to analyze business. Please check the console for details.');
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
      setBulkProgress({ current: 0, total: lines.length });
      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length >= 3) {
          const business: BusinessInfo = { name: parts[0], category: parts[1], location: parts[2], website: parts[3] || '', description: parts[4] || '' };
          try {
            const analysis = await analyzeBusiness(business, aiReady);
            newAudits.push({ id: generateId(), timestamp: Date.now(), business, analysis });
          } catch (e) { console.error('Failed to audit:', business.name, e); }
        }
        setBulkProgress({ current: i + 1, total: lines.length });
      }
      setAudits([...newAudits, ...audits]);
      setView('dashboard');
      setBulkBusinesses('');
    } catch (error) { setAnalysisError('Bulk processing failed.');
    } finally {
      setBulkProcessing(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  };

  const exportToCSV = () => {
    const headers = ['Business', 'Category', 'Location', 'SEO Score', 'GMB Optimized', 'Date'];
    const rows = audits.map(a => [a.business.name, a.business.category, a.business.location, a.analysis.seoScore, a.analysis.gmbOptimized ? 'Yes' : 'No', new Date(a.timestamp).toLocaleDateString()]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'audits.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportToJSON = () => {
    const json = JSON.stringify(audits, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'audits.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const addClient = () => {
    if (!newClient.name || !newClient.email) return;
    const client: Client = { ...newClient as Client, id: generateId(), createdAt: Date.now(), totalAudits: 0 };
    setClients([...clients, client]);
    setNewClient(DEFAULT_CLIENT);
  };

  const getScoreColorClass = (score: number) => {
    const colors = themeService.getScoreColorClass(score);
    return `${colors.text} ${colors.bg}`;
  };

  const renderCurrentView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard audits={audits} clients={clients} setView={setView} setSelectedAudit={setSelectedAudit} exportToCSV={exportToCSV} exportToJSON={exportToJSON} getScoreColorClass={getScoreColorClass} />;
      case 'audit':
        return <AuditForm settings={settings} clients={clients} selectedClientId={selectedClientId} setSelectedClientId={setSelectedClientId} newBusiness={newBusiness} setNewBusiness={setNewBusiness} handleCreateAudit={handleCreateAudit} isAnalyzing={isAnalyzing} analysisError={analysisError} aiReady={aiReady} aiInitializing={aiInitializing} setView={setView} />;
      case 'settings':
        return <Settings settings={settings} setSettings={setSettings} logoPreview={logoPreview} handleLogoUpload={handleLogoUpload} removeLogo={removeLogo} logoInputRef={logoInputRef} logoNaturalSize={logoNaturalSize} />;
      case 'report':
        return <Report selectedAudit={selectedAudit!} settings={settings} setView={setView} />;
      case 'clients':
        return <Clients clients={clients} addClient={addClient} newClient={newClient} setNewClient={setNewClient} />;
      case 'bulk':
        return <BulkAudit settings={settings} bulkBusinesses={bulkBusinesses} setBulkBusinesses={setBulkBusinesses} handleBulkAudit={handleBulkAudit} bulkProcessing={bulkProcessing} bulkProgress={bulkProgress} aiReady={aiReady} aiInitializing={aiInitializing} setView={setView} />;
      case 'templates':
        return <Templates setView={setView} />;
      default:
        return null;
    }
  };

  if (view === 'landing') {
    return (
      <AnimatePresence mode="wait">
        <LandingPage key="landing" settings={settings} logoPreview={logoPreview} currentTheme={currentTheme} setView={setView} />
      </AnimatePresence>
    );
  }

  const sidebarNav = (
    <>
      <div className="flex-1 flex flex-col gap-4">
        {[ { v: 'dashboard', icon: LayoutDashboard, title: 'Dashboard' },
          { v: 'audit', icon: Search, title: 'New Audit' },
          { v: 'clients', icon: UsersIcon, title: 'Clients' },
          { v: 'bulk', icon: UploadIcon, title: 'Bulk Audit' },
          { v: 'templates', icon: FileTextIcon, title: 'Templates' },
        ].map(({ v, icon: Icon, title }) => (
          <button key={v} title={title} onClick={() => setView(v as any)} className={`p-3 rounded-2xl transition-all ${view === v ? 'glass text-primary' : 'text-tertiary hover:text-primary hover:glass'}`}>
            <Icon size={20} />
          </button>
        ))}
      </div>
      <button title="Settings" onClick={() => setView('settings')} className={`p-3 rounded-2xl transition-all ${view === 'settings' ? 'glass text-primary' : 'text-tertiary hover:text-primary hover:glass'}`}>
        <SettingsIcon size={20} />
      </button>
    </>
  );

  return (
    <MainLayout settings={settings} logoPreview={logoPreview} sidebar={sidebarNav}>
      {renderCurrentView()}
    </MainLayout>
  );
}
