/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Code, Database, DollarSign, GitBranch, Layers, LifeBuoy, Package, Users, Zap, Rocket, BarChart3, FileText, Shield, Globe, Sparkles, ArrowRight, Star, Sun, Moon } from 'lucide-react';
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
    { title: 'AI-Powered SEO Audits', description: 'Generate comprehensive SEO reports with local AI and actionable insights in seconds.', icon: <Sparkles size={24} />, color: 'from-purple-500 to-pink-500' },
    { title: 'White-Label Ready', description: 'Complete branding control - logo, colors, custom domain. Make it yours.', icon: <Shield size={24} />, color: 'from-blue-500 to-cyan-500' },
    { title: 'Client Management', description: 'Built-in CRM to manage clients, track audits, and organize reports.', icon: <Users size={24} />, color: 'from-green-500 to-emerald-500' },
    { title: 'PDF Export', description: 'Generate stunning, branded PDF reports to impress your clients.', icon: <FileText size={24} />, color: 'from-orange-500 to-red-500' },
    { title: 'Website Scraping', description: 'Automatic SEO analysis with real website scraping and framework detection.', icon: <Globe size={24} />, color: 'from-indigo-500 to-blue-500' },
    { title: 'PageSpeed Insights', description: 'Google PageSpeed integration for comprehensive performance audits.', icon: <Rocket size={24} />, color: 'from-yellow-500 to-orange-500' },
  ];

  const stats = [
    { value: '50+', label: 'SEO Metrics Analyzed' },
    { value: '13+', label: 'Framework Detection' },
    { value: '100%', label: 'Client-Side Processing' },
    { value: '$0', label: 'Monthly Costs' },
  ];

  const testimonials = [
    { name: 'Sarah M.', role: 'SEO Agency Owner', text: 'This tool saved me thousands in development costs. Clients love the reports!', rating: 5 },
    { name: 'James K.', role: 'Freelance Marketer', text: 'Incredible value. White-labeled it for my agency in under an hour.', rating: 5 },
    { name: 'Mike R.', role: 'Digital Agency', text: 'The AI insights are spot-on. Use it for every new client onboarding.', rating: 5 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="min-h-screen relative overflow-hidden" style={{ background: themeService.createGradient() }}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Nav */}
        <header className="glass sticky top-0 z-50 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <LogoIcon settings={settings} logoPreview={logoPreview} />
              <span className="font-bold text-xl tracking-tight text-primary">{settings.brandName}</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-secondary hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-secondary hover:text-primary transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm text-secondary hover:text-primary transition-colors">Pricing</a>
            </nav>
            <div className="flex gap-3 items-center">
              <button 
                onClick={() => themeService.toggleTheme()}
                className="p-2 rounded-xl hover:bg-secondary/50 transition-colors text-secondary"
                aria-label="Toggle theme"
              >
                {currentTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button onClick={() => setView('dashboard')} className="hidden sm:block text-sm font-medium text-secondary hover:text-primary transition-colors">Live Demo</button>
              <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="px-5 py-2 rounded-full hover:opacity-90 transition-all text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25">
                Get Started
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <main className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">
          <div className="text-center space-y-8 my-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium glass border border-purple-500/20"
            >
              <Sparkles size={14} className="text-purple-500" />
              <span className="text-secondary">Now with Local AI - No API Keys Required</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-primary leading-[1.1]"
            >
              The Ultimate SEO Audit <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Platform Source Code
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-secondary max-w-3xl mx-auto leading-relaxed"
            >
              A production-ready, white-label SEO audit tool powered by AI. 
              Scrape websites, analyze PageSpeed, generate reports, and manage clients - 
              all from a beautiful browser-based app.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <button onClick={() => setView('dashboard')} className="px-8 py-4 rounded-2xl hover:opacity-90 transition-all text-base font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40">
                <Rocket size={20} />
                Try Live Demo
                <ArrowRight size={18} />
              </button>
              <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 glass rounded-2xl hover:bg-white/10 transition-all text-base font-semibold text-secondary flex items-center justify-center gap-2">
                <DollarSign size={20} />
                View Pricing
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12"
            >
              {stats.map((stat, i) => (
                <div key={i} className="glass p-6 rounded-2xl text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-sm text-secondary mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20"
          >
            <div className="glass rounded-3xl p-2 md:p-4 border border-white/10 shadow-2xl">
              <div className="glass rounded-2xl overflow-hidden">
                <div className="bg-secondary/50 px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <div className="ml-4 text-xs text-tertiary font-mono">PulseSEO Dashboard</div>
                </div>
                <div className="p-6 bg-primary/5 min-h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 size={64} className="mx-auto text-tertiary mb-4" />
                    <p className="text-secondary">Click "Try Live Demo" to see the full dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <section id="features" className="my-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-primary mb-4">Everything You Need</h2>
              <p className="text-lg text-secondary max-w-2xl mx-auto">A complete SEO audit solution with AI-powered insights, client management, and professional reporting.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="glass p-8 rounded-3xl hover:scale-[1.02] transition-all duration-300 group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-primary group-hover:text-purple-600 transition-colors">{feature.title}</h3>
                  <p className="text-secondary leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section id="how-it-works" className="my-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-primary mb-4">Simple to Use</h2>
              <p className="text-lg text-secondary max-w-2xl mx-auto">Get started in minutes. No setup required.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Enter Business Info', desc: 'Add a client business name, category, and location.' },
                { step: '02', title: 'AI Analyzes', desc: 'Our AI scrapes the website and generates comprehensive SEO insights.' },
                { step: '03', title: 'Export Report', desc: 'Download a beautiful PDF report to send to your client.' },
              ].map((item, i) => (
                <div key={i} className="relative">
                  {i < 2 && <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-tertiary"><ArrowRight size={24} /></div>}
                  <div className="glass p-8 rounded-3xl text-center">
                    <div className="text-6xl font-bold bg-gradient-to-r from-purple-600/20 to-pink-600/20 bg-clip-text text-transparent mb-4">{item.step}</div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">{item.title}</h3>
                    <p className="text-secondary">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          <section className="my-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-primary mb-4">Loved by Agencies</h2>
              <p className="text-lg text-secondary">See what SEO professionals are saying</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <div key={i} className="glass p-8 rounded-3xl">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} size={16} className="fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-secondary mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div className="font-semibold text-primary">{testimonial.name}</div>
                  <div className="text-sm text-tertiary">{testimonial.role}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="my-32 pb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-primary mb-4">Simple, One-Time Pricing</h2>
              <p className="text-lg text-secondary max-w-2xl mx-auto">No monthly fees. No subscriptions. Own the code forever.</p>
            </div>

            <div className="max-w-xl mx-auto">
              <div className="glass rounded-3xl p-10 border-2 border-purple-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                  BEST VALUE
                </div>
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-primary mb-2">Complete Source Code</h3>
                  <p className="text-secondary">Everything you need to build your SEO agency</p>
                </div>

                <div className="flex items-baseline justify-center gap-2 mb-8">
                  <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">$2,500</span>
                  <span className="text-lg text-tertiary">one-time</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    'Full source code (React + TypeScript)',
                    'Unlimited projects & clients',
                    'White-label branding included',
                    'PDF report generation',
                    'AI-powered insights',
                    'Website scraping & framework detection',
                    'PageSpeed integration',
                    'Free updates for life',
                    'Documentation included',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-secondary">
                      <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <a href="https://github.com/christopherhenrico-dotcom/PulseSEO" target="_blank" rel="noopener noreferrer" className="block w-full text-center px-8 py-4 rounded-2xl hover:opacity-90 transition-all text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/25">
                  Buy Now - $2,500
                </a>
                
                <p className="text-center text-sm text-tertiary mt-4">
                  Contact for custom enterprise licensing
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="glass py-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <SmallLogoIcon settings={settings} logoPreview={logoPreview} />
              <span className="font-semibold text-primary">{settings.brandName}</span>
            </div>
            <div className="text-sm text-tertiary">
              © 2026 PulseSEO. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="https://github.com/christopherhenrico-dotcom/PulseSEO" target="_blank" rel="noopener noreferrer" className="text-sm text-secondary hover:text-primary transition-colors">GitHub</a>
              <a href="#" className="text-sm text-secondary hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </motion.div>
  );
};
