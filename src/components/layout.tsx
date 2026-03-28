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
  <div className="min-h-screen bg-white dark:bg-black">
    <GlassSidebar settings={settings} logoPreview={logoPreview}>
      {sidebar}
    </GlassSidebar>
    <ContentArea>
      {children}
    </ContentArea>
    <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
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
  <nav className="fixed left-0 top-0 bottom-0 w-20 flex flex-col items-center py-8 gap-8 z-50 bg-white/80 dark:bg-black/50 backdrop-blur-xl border-r border-gray-200 dark:border-white/10">
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
