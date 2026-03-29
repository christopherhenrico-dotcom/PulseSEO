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
  Upload,
  Trash2
} from 'lucide-react';
import { AuditResult, Client, View } from '../../types';

interface DashboardProps {
  audits: AuditResult[];
  clients: Client[];
  setView: React.Dispatch<React.SetStateAction<View>>;
  setSelectedAudit: (audit: AuditResult) => void;
  deleteAudit: (auditId: string) => void;
  exportToCSV: () => void;
  exportToJSON: () => void;
  getScoreColorClass: (score: number) => string;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  audits, 
  clients, 
  setView, 
  setSelectedAudit,
  deleteAudit,
  exportToCSV,
  exportToJSON,
  getScoreColorClass
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
              className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl hover:glass-hover transition-all"
            >
              <Download size={16} className="text-secondary" />
              <span className="text-secondary text-sm">Export</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 glass-modal rounded-xl overflow-hidden z-50">
                <button onClick={() => { exportToCSV(); setShowExportMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-primary transition-colors text-sm">
                  <FileText size={16} className="text-tertiary" /> Export CSV
                </button>
                <button onClick={() => { exportToJSON(); setShowExportMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-primary transition-colors text-sm">
                  <FileText size={16} className="text-tertiary" /> Export JSON
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => setView('audit')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 bg-primary text-white text-sm font-medium"
          >
            <Plus size={18} />
            <span>New Audit</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2.5 text-tertiary mb-3">
            <Search size={16} />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Audits</span>
          </div>
          <div className="text-3xl font-light text-primary">{audits.length}</div>
          <div className="text-xs text-tertiary mt-1.5">All time</div>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2.5 text-tertiary mb-3">
            <ShieldCheck size={16} />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Avg. SEO Score</span>
          </div>
          <div className="text-3xl font-light text-primary">
            {audits.length > 0 
              ? Math.round(audits.reduce((acc, a) => acc + a.analysis.seoScore, 0) / audits.length)
              : 0}%
          </div>
          <div className="text-xs text-tertiary mt-1.5">
            {audits.filter(a => a.analysis.seoScore >= 80).length} excellent
          </div>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2.5 text-tertiary mb-3">
            <CheckCircle2 size={16} />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Optimized Profiles</span>
          </div>
          <div className="text-3xl font-light text-primary">
            {audits.filter(a => a.analysis.gmbOptimized).length}
          </div>
          <div className="text-xs text-tertiary mt-1.5">
            {audits.length > 0 ? Math.round(audits.filter(a => a.analysis.gmbOptimized).length / audits.length * 100) : 0}% rate
          </div>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2.5 text-tertiary mb-3">
            <Users size={16} />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Clients</span>
          </div>
          <div className="text-3xl font-light text-primary">{clients.length}</div>
          <div className="text-xs text-tertiary mt-1.5">Total clients</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-theme flex justify-between items-center">
            <h2 className="text-base font-medium text-primary">Recent Reports</h2>
            {audits.length > 0 && (
              <button onClick={() => setView('allreports')} className="text-xs text-primary/70 hover:text-primary transition-colors font-medium">View All</button>
            )}
          </div>
          <div className="divide-y divide-white/[0.04]">
            {audits.length === 0 ? (
              <div className="p-8 text-center text-tertiary">
                <FileText size={28} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No audits yet. Start by creating your first SEO report.</p>
              </div>
            ) : (
              audits.slice(0, 5).map(audit => (
                <div key={audit.id} className="p-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors cursor-pointer group" onClick={() => { setSelectedAudit(audit); setView('report'); }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm ${getScoreColorClass(audit.analysis.seoScore)}`}>
                      {audit.analysis.seoScore}
                    </div>
                    <div>
                      <h3 className="font-medium text-primary text-sm">{audit.business.name}</h3>
                      <p className="text-xs text-tertiary">{audit.business.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-tertiary">{new Date(audit.timestamp).toLocaleDateString()}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(audit.id); }}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-tertiary hover:text-red-400 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-theme">
            <h2 className="text-base font-medium text-primary">Quick Actions</h2>
          </div>
          <div className="p-5 space-y-2">
            <button onClick={() => setView('audit')} className="w-full p-4 rounded-xl hover:bg-white/[0.03] transition-colors flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <Plus size={18} />
              </div>
              <div className="text-left">
                <div className="font-medium text-primary text-sm">New Audit</div>
                <div className="text-xs text-tertiary">Create a single SEO report</div>
              </div>
            </button>
            <button onClick={() => setView('bulk')} className="w-full p-4 rounded-xl hover:bg-white/[0.03] transition-colors flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg glass flex items-center justify-center text-secondary">
                <Upload size={18} />
              </div>
              <div className="text-left">
                <div className="font-medium text-primary text-sm">Bulk Import</div>
                <div className="text-xs text-tertiary">Process multiple businesses at once</div>
              </div>
            </button>
            <button onClick={() => setView('clients')} className="w-full p-4 rounded-xl hover:bg-white/[0.03] transition-colors flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg glass flex items-center justify-center text-secondary">
                <Users size={18} />
              </div>
              <div className="text-left">
                <div className="font-medium text-primary text-sm">Manage Clients</div>
                <div className="text-xs text-tertiary">Add and organize your clients</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 glass-blur-overlay flex items-center justify-center z-50 p-4">
          <div className="glass-modal rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary">Delete Report</h2>
                <p className="text-sm text-secondary">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-secondary">
              Are you sure you want to delete the report for <span className="font-medium text-primary">{audits.find(a => a.id === deleteConfirmId)?.business.name}</span>?
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl glass-card text-secondary hover:text-primary transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => { deleteAudit(deleteConfirmId); setDeleteConfirmId(null); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
