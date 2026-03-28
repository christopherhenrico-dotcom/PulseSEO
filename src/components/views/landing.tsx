/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Code, Database, DollarSign, GitBranch, Layers, LifeBuoy, Package, Users, Zap, Sun, Moon } from 'lucide-react';
import { WhiteLabelSettings, ThemeMode, View } from '../../types';
import { LogoIcon, SmallLogoIcon } from '../common';
import themeService from '../../services/themeservice';

interface LandingPageProps {
  settings: WhiteLabelSettings;
  logoPreview: string | null;
  currentTheme: ThemeMode;
  setView: React.Dispatch<React.SetStateAction<View>>;
}

export const LandingPage: React.FC<LandingPageProps> = ({ settings, logoPreview, currentTheme, setView }) => {
  const features = [
    { title: '100% White-Label', description: 'Customize the branding and color scheme to match your agency.', icon: <Package size={24} /> },
    { title: 'Run Locally in Browser', description: 'No server costs. No API keys. No monthly fees. Unrestricted access.', icon: <Zap size={24} /> },
    { title: 'Client Management', description: 'Onboard and manage clients, and assign SEO reports to them.', icon: <Users size={24} /> },
    { title: 'AI-Powered Audits', description: 'Generate in-depth SEO reports with actionable, AI-powered insights.', icon: <CheckCircle size={24} /> },
    { title: 'Export to PDF', description: 'Create professional, branded PDF reports that you can send to clients.', icon: <Database size={24} /> },
    { title: 'Modern Tech Stack', description: 'Built with React, Vite, and Tailwind CSS for a fast, modern developer experience.', icon: <Code size={24} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="min-h-screen" style={{ background: themeService.createGradient() }}>
        <header className="glass sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <LogoIcon settings={settings} logoPreview={logoPreview} />
              <span className="font-semibold text-xl tracking-tight text-primary">PulseSEO</span>
            </div>
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => themeService.toggleTheme()}
                className="p-2 rounded-xl hover:bg-secondary transition-colors text-secondary"
                aria-label="Toggle theme"
              >
                {currentTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button onClick={() => setView('dashboard')} className="text-secondary hover:text-primary font-medium transition-colors">Live Demo</button>
              <a href="#pricing" className="px-5 py-2 rounded-full hover:opacity-90 transition-all font-medium bg-accent text-primary">Buy Now</a>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center space-y-8 my-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium glass-card text-secondary">
              <Zap size={16} style={{ color: settings.primaryColor }} />
              100% White-Label, AI-Powered SEO Audit Tool
            </div>
            <h1 className="text-6xl font-light tracking-tight text-primary leading-tight">
              The Complete Source Code for a <br />
              <span className="font-semibold" style={{ color: settings.primaryColor }}>AI-Powered SEO Audit Tool</span>
            </h1>
            <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
              For sale: the complete source code for a modern, AI-powered SEO audit tool. This is a production-ready, white-label application that runs entirely in the browser. No servers, no APIs, no limits.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setView('dashboard')} className="px-8 py-4 rounded-2xl hover:opacity-90 transition-all text-lg font-medium flex items-center gap-2 bg-accent text-primary">
                <Layers size={20} />
                Live Demo
              </button>
              <a href="#pricing" className="px-8 py-4 glass-card rounded-2xl hover:glass-hover transition-all text-lg font-medium text-secondary">
                <DollarSign size={20} />
                Buy Now
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-20">
            {features.map((feature, i) => (
              <div key={i} className="glass-card p-8 rounded-3xl hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center mb-6">
                  {React.cloneElement(feature.icon, { className: 'text-secondary' })}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-primary">{feature.title}</h3>
                <p className="text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>

          <div id="pricing" className="my-20 pt-10">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-light tracking-tight text-primary">Get the Complete Codebase</h2>
              <p className="text-lg text-secondary mt-3 max-w-2xl mx-auto">A one-time payment for the full source code. No licenses, no restrictions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="glass-card p-10 rounded-3xl border-2 border-primary">
                <h3 className="text-2xl font-semibold text-primary mb-2">Lifetime License</h3>
                <p className="text-secondary mb-6">The complete, unminified source code for PulseSEO.</p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-bold text-primary">$2,500</span>
                  <span className="text-lg text-tertiary">/ one-time</span>
                </div>
                <a href="https://buy.stripe.com/some-stripe-link" className="w-full text-center block px-8 py-4 rounded-2xl hover:opacity-90 transition-all text-lg font-medium bg-accent text-primary">
                  Buy Now
                </a>
                <ul className="text-secondary space-y-4 mt-8">
                  <li className="flex items-center gap-3"><CheckCircle size={18} className="text-success" /> Full source code</li>
                  <li className="flex items-center gap-3"><CheckCircle size={18} className="text-success" /> Use on unlimited projects</li>
                  <li className="flex items-center gap-3"><CheckCircle size={18} className="text-success" /> Free updates for life</li>
                  <li className="flex items-center gap-3"><CheckCircle size={18} className="text-success" /> Community support</li>
                </ul>
              </div>

              <div className="glass-card p-10 rounded-3xl">
                <h3 className="text-2xl font-semibold text-primary mb-2">What You Get</h3>
                <p className="text-secondary mb-8">A production-ready, client-side application.</p>
                <ul className="text-secondary space-y-5">
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0 mt-1">
                      <GitBranch size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">Complete Codebase</h4>
                      <p className="text-sm">The full, unminified source code for the entire application, including all components, services, and styles.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0 mt-1">
                      <LifeBuoy size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">Documentation</h4>
                      <p className="text-sm">Comprehensive documentation on how to get started, customize, and deploy the application.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0 mt-1">
                      <Users size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">Community Access</h4>
                      <p className="text-sm">Join a community of other buyers to share tips, ask questions, and get support.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>

        <footer className="glass py-12 mt-20">
          <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <SmallLogoIcon settings={settings} logoPreview={logoPreview} />
              <span className="font-medium text-primary">PulseSEO</span>
            </div>
            <div className="text-sm text-tertiary">
              © 2024 PulseSEO. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </motion.div>
  );
};
