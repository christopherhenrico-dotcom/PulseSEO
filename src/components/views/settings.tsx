/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ImagePlus, Trash, Upload, Globe, Mail, Palette, Check, Sun, Moon } from 'lucide-react';
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
    className="max-w-4xl mx-auto space-y-8 py-12"
  >
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-light tracking-tight text-gray-900 dark:text-white">White-Label Settings</h1>
      <p className="text-gray-600 dark:text-gray-400">Customize the app to match your agency branding.</p>
    </div>

    <div className="space-y-6">
      {/* Theme Toggle */}
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentTheme === 'light' ? <Moon size={20} className="text-gray-600" /> : <Sun size={20} className="text-yellow-500" />}
            <span className="font-medium text-gray-900 dark:text-white">Dark Mode</span>
          </div>
          <button 
            onClick={onThemeToggle}
            className={`w-12 h-6 rounded-full transition-colors ${currentTheme === 'dark' ? 'bg-purple-600' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${currentTheme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Logo Upload */}
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl p-8 rounded-3xl space-y-6 border border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ImagePlus size={18} /> Brand Identity
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-2xl">
          {logoPreview ? (
            <div className="text-center">
              <img src={logoPreview} alt="Logo" className="max-h-32 mx-auto mb-4 rounded-xl" />
              <button onClick={removeLogo} className="text-red-500 text-sm flex items-center gap-1 mx-auto">
                <Trash size={14} /> Remove
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-500 mb-2">PNG, JPG, SVG up to 2MB</p>
              <label className="cursor-pointer px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Upload Logo
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Name</label>
            <input
              type="text"
              value={settings.brandName}
              onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color</label>
            <div className="flex gap-4 items-center">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">This color will be used for buttons, links, and accent elements.</p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl p-8 rounded-3xl space-y-6 border border-gray-200 dark:border-white/10">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Globe size={18} /> Contact Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Support Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={settings.supportEmail || ''}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="support@yourcompany.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website</label>
            <div className="relative">
              <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                value={settings.website || ''}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium text-gray-900 dark:text-white">Show PulseSEO Watermark</span>
            <p className="text-sm text-gray-500">Display "Powered by PulseSEO" in reports</p>
          </div>
          <button 
            onClick={() => setSettings({ ...settings, showWatermark: !settings.showWatermark })}
            className={`w-12 h-6 rounded-full transition-colors ${settings.showWatermark ? 'bg-purple-600' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${settings.showWatermark ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Reset */}
      <div className="pt-6">
        <button
          onClick={() => setSettings(DEFAULT_WHITE_LABEL)}
          className="text-sm text-red-500 hover:text-red-600 transition-colors"
        >
          Reset to default settings
        </button>
      </div>
    </div>
  </motion.div>
);
