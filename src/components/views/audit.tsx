/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Loader2, Zap, AlertCircle } from 'lucide-react';
import { Client, BusinessInfo, WhiteLabelSettings } from '../../types';

interface AuditFormProps {
  settings: WhiteLabelSettings;
  clients: Client[];
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  newBusiness: BusinessInfo;
  setNewBusiness: (business: BusinessInfo) => void;
  handleCreateAudit: (e: React.FormEvent) => void;
  isAnalyzing: boolean;
  analysisError: string | null;
  aiReady: boolean;
  aiInitializing: boolean;
  setView: (view: string) => void;
}

export const AuditForm: React.FC<AuditFormProps> = ({ 
  settings, 
  clients, 
  selectedClientId, 
  setSelectedClientId, 
  newBusiness, 
  setNewBusiness, 
  handleCreateAudit, 
  isAnalyzing, 
  analysisError, 
  aiReady, 
  aiInitializing, 
  setView 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="max-w-2xl mx-auto space-y-8 py-12"
  >
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-light tracking-tight text-primary">New SEO Audit</h1>
      <p className="text-secondary">Provide business details for a comprehensive analysis.</p>
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
            {aiInitializing ? 'Initializing AI engine...' : aiReady ? 'AI engine ready for intelligent analysis' : 'AI engine is offline'}
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
  </motion.div>
);
