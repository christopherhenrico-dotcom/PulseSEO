/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogoIcon } from './common';
import { WhiteLabelSettings } from '../types';
import { ShieldCheck } from 'lucide-react';

interface MainLayoutProps {
  settings: WhiteLabelSettings;
  logoPreview: string | null;
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ settings, logoPreview, children, sidebar }) => (
  <div className="min-h-screen">
    <div className="glass-panel" style={{ display: 'flex', minHeight: '90vh', maxWidth: '1400px', margin: '5vh auto', borderRadius: '16px', overflow: 'hidden' }}>
      <GlassSidebar settings={settings} logoPreview={logoPreview}>
        {sidebar}
      </GlassSidebar>
      <ContentArea>
        {children}
      </ContentArea>
    </div>
    <div className="fixed bottom-6 right-6 flex items-center gap-2 glass rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
      <ShieldCheck size={12} />
      <span>White Label Active</span>
    </div>
  </div>
);

interface GlassSidebarProps {
  settings: WhiteLabelSettings;
  logoPreview: string | null;
  children: React.ReactNode;
}

export const GlassSidebar: React.FC<GlassSidebarProps> = ({ settings, logoPreview, children }) => (
  <aside className="glass-sidebar" style={{ width: '80px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
    <LogoIcon settings={settings} logoPreview={logoPreview} />
    {children}
  </aside>
);

interface ContentAreaProps {
  children: React.ReactNode;
}

export const ContentArea: React.FC<ContentAreaProps> = ({ children }) => (
  <main className="flex-1" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'auto' }}>
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  </main>
);
