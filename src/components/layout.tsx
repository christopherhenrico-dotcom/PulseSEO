/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogoIcon } from './common';
import { WhiteLabelSettings } from '../types';

interface MainLayoutProps {
  settings: WhiteLabelSettings;
  logoPreview: string | null;
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ settings, logoPreview, children, sidebar }) => (
  <div className="min-h-screen scrollbar-glass" style={{ background: themeService.createGradient() }}>
    <GlassSidebar settings={settings} logoPreview={logoPreview}>
      {sidebar}
    </GlassSidebar>
    <ContentArea>
      {children}
    </ContentArea>
    <div className="fixed bottom-6 right-6 flex items-center gap-2 glass rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-tertiary">
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
  <nav className="glass-sidebar fixed left-0 top-0 bottom-0 w-20 flex flex-col items-center py-8 gap-8 z-50">
    <LogoIcon settings={settings} logoPreview={logoPreview} />
    {children}
  </nav>
);

interface ContentAreaProps {
  children: React.ReactNode;
}

export const ContentArea: React.FC<ContentAreaProps> = ({ children }) => (
  <main className="pl-20 min-h-screen">
    <div className="max-w-6xl mx-auto px-8 py-12">
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </div>
  </main>
);
