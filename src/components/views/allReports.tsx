/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { FileText, ChevronRight } from 'lucide-react';
import { AuditResult, View } from '../../types';

interface AllReportsProps {
  audits: AuditResult[];
  setView: React.Dispatch<React.SetStateAction<View>>;
  setSelectedAudit: (audit: AuditResult) => void;
  getScoreColorClass: (score: number) => string;
}

export const AllReports: React.FC<AllReportsProps> = ({ audits, setView, setSelectedAudit, getScoreColorClass }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="max-w-5xl mx-auto space-y-6 py-8"
  >
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-light tracking-tight text-primary">All Reports</h1>
        <p className="text-secondary text-sm mt-1">{audits.length} total audit{audits.length !== 1 ? 's' : ''}</p>
      </div>
      <button
        onClick={() => setView('dashboard')}
        className="text-sm text-secondary hover:text-primary transition-colors"
      >
        Back to Dashboard
      </button>
    </div>

    {audits.length === 0 ? (
      <div className="text-center py-16 glass-card rounded-2xl">
        <FileText className="mx-auto text-tertiary mb-4" size={40} />
        <h3 className="text-lg font-medium text-primary mb-2">No reports yet</h3>
        <p className="text-secondary text-sm mb-6">Run your first audit to see reports here.</p>
        <button
          onClick={() => setView('audit')}
          className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-all"
        >
          Create First Audit
        </button>
      </div>
    ) : (
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="divide-y divide-white/[0.04]">
          {audits.map(audit => (
            <div
              key={audit.id}
              className="p-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors cursor-pointer"
              onClick={() => { setSelectedAudit(audit); setView('report'); }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm ${getScoreColorClass(audit.analysis.seoScore)}`}>
                  {audit.analysis.seoScore}
                </div>
                <div>
                  <h3 className="font-medium text-primary text-sm">{audit.business.name}</h3>
                  <p className="text-xs text-tertiary">{audit.business.category} &middot; {audit.business.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-tertiary">{new Date(audit.timestamp).toLocaleDateString()}</span>
                <ChevronRight size={16} className="text-tertiary" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </motion.div>
);
