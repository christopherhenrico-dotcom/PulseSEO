/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { FileText, Layout } from 'lucide-react';
import { View } from '../../types';

interface TemplatesProps {
  setView: React.Dispatch<React.SetStateAction<View>>;
}

export const Templates: React.FC<TemplatesProps> = ({ setView }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="max-w-4xl mx-auto space-y-8 py-12"
  >
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
  </motion.div>
);
