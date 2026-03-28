/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { ChevronRight, Share2, ShieldCheck, AlertCircle, Globe, Zap, Mail } from 'lucide-react';
import { AuditResult, WhiteLabelSettings } from '../../types';

interface ReportProps {
  selectedAudit: AuditResult;
  settings: WhiteLabelSettings;
  setView: (view: string) => void;
}

export const Report: React.FC<ReportProps> = ({ selectedAudit, settings, setView }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!selectedAudit) return null;

  const { business, analysis } = selectedAudit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto space-y-12 py-12 pb-24"
    >
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

      <div ref={reportRef} className="glass-card rounded-[40px] overflow-hidden">
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
    </motion.div>
  );
};
