/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Loader2, Zap } from 'lucide-react';
import { WhiteLabelSettings } from '../../types';

interface BulkAuditProps {
  settings: WhiteLabelSettings;
  bulkBusinesses: string;
  setBulkBusinesses: (businesses: string) => void;
  handleBulkAudit: () => void;
  bulkProcessing: boolean;
  bulkProgress: { current: number; total: number };
  aiReady: boolean;
  aiInitializing: boolean;
  setView: (view: string) => void;
}

export const BulkAudit: React.FC<BulkAuditProps> = ({ 
  settings, 
  bulkBusinesses, 
  setBulkBusinesses, 
  handleBulkAudit, 
  bulkProcessing, 
  bulkProgress, 
  aiReady, 
  aiInitializing, 
  setView 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="max-w-4xl mx-auto space-y-8 py-12"
  >
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
          placeholder={`Business Name, Category, Location, Website (optional)\nJoe's Coffee, Coffee Shop, Austin TX, https://joescoffee.com\nABC Plumbing, Plumbing, Dallas TX\nDowntown Dental, Dentist, Houston TX, https://downtowndental.com`}
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
  </motion.div>
);
