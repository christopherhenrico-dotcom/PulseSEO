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
    <div className="glass-panel" style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      <GlassSidebar settings={settings} logoPreview={logoPreview}>
        {sidebar}
      </GlassSidebar>
      <ContentArea>
        {children}
      </ContentArea>
    </div>
    <div className="fixed bottom-5 right-5 flex items-center gap-2 glass rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-tertiary">
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
  <aside className="glass-sidebar" style={{ width: '72px', padding: '20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
    <LogoIcon settings={settings} logoPreview={logoPreview} />
    {children}
  </aside>
);

interface ContentAreaProps {
  children: React.ReactNode;
}

export const ContentArea: React.FC<ContentAreaProps> = ({ children }) => (
  <main className="flex-1" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', overflow: 'auto' }}>
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  </main>
);
