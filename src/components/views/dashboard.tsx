/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Download,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  CheckCircle2,
  Users,
  Upload
} from 'lucide-react';
import { AuditResult, Client } from '../../types';

interface DashboardProps {
  audits: AuditResult[];
  clients: Client[];
  setView: (view: string) => void;
  setSelectedAudit: (audit: AuditResult) => void;
  exportToCSV: () => void;
  exportToJSON: () => void;
  getScoreColorClass: (score: number) => string;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  audits, 
  clients, 
  setView, 
  setSelectedAudit,
  exportToCSV,
  exportToJSON,
  getScoreColorClass
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
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
    </motion.div>
  );
}
