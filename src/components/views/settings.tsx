/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ImagePlus, Trash, Upload, Globe, Mail, Check, Sun, Moon } from 'lucide-react';
import { WhiteLabelSettings, DEFAULT_WHITE_LABEL } from '../../types';
import { SmallLogoIcon } from '../common';
import { Theme } from '../../services/theme';

interface SettingsProps {
  settings: WhiteLabelSettings;
  setSettings: (settings: WhiteLabelSettings) => void;
  logoPreview: string | null;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeLogo: () => void;
  logoInputRef: React.RefObject<HTMLInputElement>;
  logoNaturalSize: { width: number; height: number } | null;
  currentTheme: Theme;
  onThemeToggle: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  settings, 
  setSettings, 
  logoPreview, 
  handleLogoUpload, 
  removeLogo, 
  logoInputRef, 
  logoNaturalSize,
  currentTheme,
  onThemeToggle
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="max-w-3xl mx-auto space-y-6 py-8"
  >
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-light tracking-tight text-primary">White-Label Settings</h1>
      <p className="text-secondary text-sm">Customize the app to match your agency branding.</p>
    </div>

    <div className="space-y-5">
      <div className="glass-card p-5 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentTheme === 'light' ? <Moon size={18} className="text-secondary" /> : <Sun size={18} className="text-primary" />}
          <span className="font-medium text-primary text-sm">Dark Mode</span>
        </div>
        <button 
          onClick={onThemeToggle}
          className={`w-11 h-6 rounded-full transition-colors ${currentTheme === 'dark' ? 'bg-primary' : 'bg-white/10'}`}
        >
          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${currentTheme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      <div className="glass-card p-7 rounded-2xl space-y-6">
        <h2 className="text-base font-semibold text-primary flex items-center gap-2">
          <ImagePlus size={16} /> Brand Identity
        </h2>

        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-white/10 rounded-xl">
          {logoPreview ? (
            <div className="text-center">
              <img src={logoPreview} alt="Logo" className="max-h-24 mx-auto mb-3 rounded-lg" />
              <button onClick={removeLogo} className="text-error text-xs flex items-center gap-1 mx-auto hover:opacity-80 transition-opacity">
                <Trash size={12} /> Remove
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload size={28} className="mx-auto text-tertiary mb-2" />
              <p className="text-xs text-tertiary mb-3">PNG, JPG, SVG up to 2MB</p>
              <label className="cursor-pointer px-4 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:opacity-90 transition-opacity">
                Upload Logo
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5 uppercase tracking-wider">Brand Name</label>
            <input
              type="text"
              value={settings.brandName}
              onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl glass-input text-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5 uppercase tracking-wider">Primary Color</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-11 h-11 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="flex-1 px-4 py-3 rounded-xl glass-input text-primary text-sm"
              />
            </div>
            <p className="text-xs text-tertiary mt-1.5">Used for buttons, links, and accent elements.</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-7 rounded-2xl space-y-5">
        <h2 className="text-base font-semibold text-primary flex items-center gap-2">
          <Globe size={16} /> Contact Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5 uppercase tracking-wider">Support Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary" />
              <input
                type="email"
                value={settings.supportEmail || ''}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-primary text-sm"
                placeholder="support@yourcompany.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5 uppercase tracking-wider">Website</label>
            <div className="relative">
              <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary" />
              <input
                type="url"
                value={settings.website || ''}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-primary text-sm"
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-5 rounded-xl flex items-center justify-between">
        <div>
          <span className="font-medium text-primary text-sm">Show PulseSEO Watermark</span>
          <p className="text-xs text-tertiary">Display "Powered by PulseSEO" in reports</p>
        </div>
        <button 
          onClick={() => setSettings({ ...settings, showWatermark: !settings.showWatermark })}
          className={`w-11 h-6 rounded-full transition-colors ${settings.showWatermark ? 'bg-primary' : 'bg-white/10'}`}
        >
          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${settings.showWatermark ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      <div className="pt-4 text-center">
        <button
          onClick={() => setSettings(DEFAULT_WHITE_LABEL)}
          className="text-xs text-tertiary hover:text-error transition-colors"
        >
          Reset to default settings
        </button>
      </div>
    </div>
  </motion.div>
);
