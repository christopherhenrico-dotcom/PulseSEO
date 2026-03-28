/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ImagePlus, Trash, Upload, Globe, Mail, Palette, Layout, BarChart3, Check, Sun, Moon } from 'lucide-react';
import { WhiteLabelSettings } from '../../types';
import themeService from '../../services/themeservice';
import { SmallLogoIcon } from '../common';

interface SettingsProps {
  settings: WhiteLabelSettings;
  setSettings: (settings: WhiteLabelSettings) => void;
  logoPreview: string | null;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeLogo: () => void;
  logoInputRef: React.RefObject<HTMLInputElement>;
  logoNaturalSize: { width: number; height: number } | null;
}

export const Settings: React.FC<SettingsProps> = ({ 
  settings, 
  setSettings, 
  logoPreview, 
  handleLogoUpload, 
  removeLogo, 
  logoInputRef, 
  logoNaturalSize 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="max-w-4xl mx-auto space-y-8 py-12"
  >
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-light tracking-tight text-primary">White-Label Settings</h1>
      <p className="text-secondary">Customize the app to match your agency branding.</p>
    </div>

    <div className="space-y-6">
      <div className="glass-card p-8 rounded-3xl space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <ImagePlus size={18} /> Brand Identity
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-secondary">Logo Upload</label>
            <div className="space-y-4">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label 
                htmlFor="logo-upload"
                className="glass-logo-container rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[120px] hover:scale-[1.02]"
              >
                {logoPreview ? (
                  <div className="relative group">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="logo-preview max-h-20"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-secondary bg-secondary/80 px-2 py-1 rounded">Change</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="text-tertiary mb-3" />
                    <span className="text-sm text-secondary">Click to upload logo</span>
                    <span className="text-xs text-tertiary mt-1">PNG, JPG, SVG up to 2MB</span>
                  </>
                )}
              </label>
              {logoPreview && (
                <button
                  onClick={removeLogo}
                  className="flex items-center gap-2 text-sm text-error hover:opacity-80 transition-opacity"
                >
                  <Trash size={14} />
                  Remove logo
                </button>
              )}
              {logoNaturalSize && (
                <p className="text-xs text-tertiary">
                  Original size: {logoNaturalSize.width} × {logoNaturalSize.height}px
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary flex items-center gap-2">
                <Globe size={14} /> Brand Name
              </label>
              <input 
                type="text"
                value={settings.brandName}
                onChange={e => setSettings({ ...settings, brandName: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl glass-input text-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary flex items-center gap-2">
                <Mail size={14} /> Support Email
              </label>
              <input 
                type="email"
                value={settings.supportEmail}
                onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl glass-input text-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary flex items-center gap-2">
                <Globe size={14} /> Website URL
              </label>
              <input 
                type="url"
                value={settings.website || ''}
                onChange={e => setSettings({ ...settings, website: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl glass-input text-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 rounded-3xl space-y-8">
        <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
          <Palette size={18} /> Colors & Theme
        </h2>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-medium uppercase tracking-wider text-secondary">Base Theme</label>
            <div className="flex gap-3">
              <button
                onClick={() => { themeService.setTheme('light'); setSettings({ ...settings, theme: 'light' }); }}
                className={`flex-1 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  settings.theme === 'light' 
                    ? 'bg-accent text-primary' 
                    : 'glass-card hover:glass-hover text-secondary'
                }`}
              >
                <Sun size={18} />
                Light
              </button>
              <button
                onClick={() => { themeService.setTheme('dark'); setSettings({ ...settings, theme: 'dark' }); }}
                className={`flex-1 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  settings.theme === 'dark' 
                    ? 'bg-accent text-primary' 
                    : 'glass-card hover:glass-hover text-secondary'
                }`}
              >
                <Moon size={18} />
                Dark
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium uppercase tracking-wider text-secondary">Primary Color</label>
            <p className="text-xs text-tertiary">This color will be used for buttons, links, and accent elements.</p>
            <div className="flex gap-4 items-center">
              <input 
                type="color"
                value={settings.primaryColor}
                onChange={e => {
                  setSettings({ ...settings, primaryColor: e.target.value });
                  themeService.applyCustomColors({ ...settings, primaryColor: e.target.value });
                }}
                className="w-16 h-16 rounded-xl border-none cursor-pointer"
              />
              <input 
                type="text"
                value={settings.primaryColor}
                onChange={e => {
                  setSettings({ ...settings, primaryColor: e.target.value });
                  themeService.applyCustomColors({ ...settings, primaryColor: e.target.value });
                }}
                className="flex-1 px-4 py-3 rounded-2xl glass-input text-primary"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['#000000', '#1A56DB', '#059669', '#7C3AED', '#DB2777', '#EA580C', '#0891B2', '#4F46E5'].map(color => (
                <button
                  key={color}
                  onClick={() => {
                    setSettings({ ...settings, primaryColor: color });
                    themeService.applyCustomColors({ ...settings, primaryColor: color });
                  }}
                  className="w-10 h-10 rounded-lg border-2 transition-all"
                  style={{ 
                    backgroundColor: color,
                    borderColor: settings.primaryColor === color ? 'var(--accent)' : 'transparent'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary">Card Background</label>
              <div className="flex gap-3 items-center">
                <input 
                  type="color"
                  value={settings.colors.surface.slice(0, 7)}
                  onChange={e => setSettings({ 
                    ...settings, 
                    colors: { ...settings.colors, surface: e.target.value }
                  })}
                  className="w-12 h-12 rounded-xl border-none cursor-pointer"
                />
                <input 
                  type="text"
                  value={settings.colors.surface}
                  onChange={e => setSettings({ 
                    ...settings, 
                    colors: { ...settings.colors, surface: e.target.value }
                  })}
                  className="flex-1 px-4 py-2 rounded-xl glass-input text-primary text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary">Border Color</label>
              <div className="flex gap-3 items-center">
                <input 
                  type="color"
                  value={settings.colors.border.match(/\d+/g)?.slice(0, 3).join(',').split(',').length === 3 ? '#333' : settings.colors.border.slice(0, 7)}
                  onChange={e => {
                    const alpha = settings.colors.border.includes('rgba') ? 
                      settings.colors.border.match(/[\d.]+\)$/)?.[0] : '0.08)';
                    setSettings({ 
                      ...settings, 
                      colors: { ...settings.colors, border: `${e.target.value}${alpha}` }
                    });
                  }}
                  className="w-12 h-12 rounded-xl border-none cursor-pointer"
                />
                <input 
                  type="text"
                  value={settings.colors.border}
                  onChange={e => setSettings({ 
                    ...settings, 
                    colors: { ...settings.colors, border: e.target.value }
                  })}
                  className="flex-1 px-4 py-2 rounded-xl glass-input text-primary text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary">Primary Text</label>
              <div className="flex gap-3 items-center">
                <input 
                  type="color"
                  value={settings.colors.text.slice(0, 7)}
                  onChange={e => setSettings({ 
                    ...settings, 
                    colors: { ...settings.colors, text: e.target.value }
                  })}
                  className="w-12 h-12 rounded-xl border-none cursor-pointer"
                />
                <input 
                  type="text"
                  value={settings.colors.text}
                  onChange={e => setSettings({ 
                    ...settings, 
                    colors: { ...settings.colors, text: e.target.value }
                  })}
                  className="flex-1 px-4 py-2 rounded-xl glass-input text-primary text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-secondary">Secondary Text</label>
              <div className="flex gap-3 items-center">
                <input 
                  type="color"
                  value={settings.colors.textSecondary.slice(0, 7)}
                  onChange={e => setSettings({ 
                    ...settings, 
                    colors: { ...settings.colors, textSecondary: e.target.value }
                  })}
                  className="w-12 h-12 rounded-xl border-none cursor-pointer"
                />
                <input 
                  type="text"
                  value={settings.colors.textSecondary}
                  onChange={e => setSettings({ 
                    ...settings, 
                    colors: { ...settings.colors, textSecondary: e.target.value }
                  })}
                  className="flex-1 px-4 py-2 rounded-xl glass-input text-primary text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium uppercase tracking-wider text-secondary">Status Colors</label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: settings.colors.success }} />
                  <span className="text-xs text-secondary">Success</span>
                </div>
                <input 
                  type="color"
                  value={settings.colors.success}
                  onChange={e => setSettings({ 
                    ...settings, 
                    colors: { ...settings.colors, success: e.target.value }
                  })}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: settings.colors.warning }} />
                  <span className="text-xs text-secondary">Warning</span>
                </div>
                <input 
                  type="color"
                  value={settings.colors.warning}
                  onChange={e => setSettings({ 
                    ...settings, 
                    colors: { ...settings.colors, warning: e.target.value }
                  })}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: settings.colors.error }} />
                  <span className="text-xs text-secondary">Error</span>
                </div>
                <input 
                  type="color"
                  value={settings.colors.error}
                  onChange={e => setSettings({ 
                    ...settings, 
                    colors: { ...settings.colors, error: e.target.value }
                  })}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 rounded-3xl space-y-8">
        <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
          <Layout size={18} /> Typography
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-medium uppercase tracking-wider text-secondary">Heading Font</label>
            <select 
              value={settings.fonts.headingFont}
              onChange={e => setSettings({ ...settings, fonts: { ...settings.fonts, headingFont: e.target.value } })}
              className="w-full px-4 py-3 rounded-2xl glass-input text-primary"
            >
              <option value="Inter">Inter</option>
              <option value="Poppins">Poppins</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Raleway">Raleway</option>
              <option value="Oswald">Oswald</option>
              <option value="Roboto Slab">Roboto Slab</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium uppercase tracking-wider text-secondary">Body Font</label>
            <select 
              value={settings.fonts.bodyFont}
              onChange={e => setSettings({ ...settings, fonts: { ...settings.fonts, bodyFont: e.target.value } })}
              className="w-full px-4 py-3 rounded-2xl glass-input text-primary"
            >
              <option value="Inter">Inter</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Source Sans Pro">Source Sans Pro</option>
              <option value="Nunito">Nunito</option>
              <option value="Work Sans">Work Sans</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium uppercase tracking-wider text-secondary">Heading Weight</label>
            <input 
              type="range"
              min="300"
              max="900"
              step="100"
              value={settings.fonts.headingWeight}
              onChange={e => setSettings({ ...settings, fonts: { ...settings.fonts, headingWeight: parseInt(e.target.value) } })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-tertiary">
              <span>Light (300)</span>
              <span className="font-semibold text-primary">{settings.fonts.headingWeight}</span>
              <span>Bold (900)</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium uppercase tracking-wider text-secondary">Logo Height</label>
            <div className="flex items-center gap-4">
              <input 
                type="range"
                min="24"
                max="80"
                value={settings.logoHeight}
                onChange={e => setSettings({ ...settings, logoHeight: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm font-medium text-primary w-12 text-right">{settings.logoHeight}px</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 rounded-3xl space-y-8">
        <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
          <Layout size={18} /> Layout & Spacing
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-medium uppercase tracking-wider text-secondary">Corner Radius</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-secondary">Small</span>
                <input 
                  type="text"
                  value={settings.borderRadius.small}
                  onChange={e => setSettings({ ...settings, borderRadius: { ...settings.borderRadius, small: e.target.value } })}
                  className="w-20 px-2 py-1 rounded glass-input text-primary text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-secondary">Medium</span>
                <input 
                  type="text"
                  value={settings.borderRadius.medium}
                  onChange={e => setSettings({ ...settings, borderRadius: { ...settings.borderRadius, medium: e.target.value } })}
                  className="w-20 px-2 py-1 rounded glass-input text-primary text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-secondary">Large</span>
                <input 
                  type="text"
                  value={settings.borderRadius.large}
                  onChange={e => setSettings({ ...settings, borderRadius: { ...settings.borderRadius, large: e.target.value } })}
                  className="w-20 px-2 py-1 rounded glass-input text-primary text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium uppercase tracking-wider text-secondary">Preset Styles</label>
            <div className="space-y-2">
              <button 
                onClick={() => setSettings({ 
                  ...settings, 
                  borderRadius: { small: '4px', medium: '8px', large: '12px', full: '9999px' }
                })}
                className="w-full px-3 py-2 rounded-lg text-xs glass-card hover:glass-hover text-secondary transition-all"
              >
                Sharp
              </button>
              <button 
                onClick={() => setSettings({ 
                  ...settings, 
                  borderRadius: { small: '8px', medium: '16px', large: '24px', full: '9999px' }
                })}
                className="w-full px-3 py-2 rounded-lg text-xs glass-card hover:glass-hover text-secondary transition-all"
              >
                Rounded
              </button>
              <button 
                onClick={() => setSettings({ 
                  ...settings, 
                  borderRadius: { small: '16px', medium: '24px', large: '32px', full: '9999px' }
                })}
                className="w-full px-3 py-2 rounded-lg text-xs glass-card hover:glass-hover text-secondary transition-all"
              >
                Pill
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium uppercase tracking-wider text-secondary">Options</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={settings.showWatermark}
                  onChange={e => setSettings({ ...settings, showWatermark: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span className="text-sm text-secondary">Show "Powered by" watermark</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 rounded-3xl space-y-8">
        <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
          <BarChart3 size={18} /> Preview
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 glass-card rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <SmallLogoIcon settings={settings} logoPreview={logoPreview} />
              <span className="font-semibold text-primary">{settings.brandName}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-tertiary">Primary:</span>
                <div 
                  className="w-5 h-5 rounded" 
                  style={{ backgroundColor: settings.primaryColor }}
                />
                <span className="text-xs text-tertiary">{settings.primaryColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-tertiary">Text:</span>
                <span className="text-xs text-primary">{settings.colors.text}</span>
              </div>
            </div>
            <button 
              className="w-full py-2 rounded-xl text-sm font-medium"
              style={{ backgroundColor: settings.primaryColor, color: settings.colors.text }}
            >
              Sample Button
            </button>
          </div>

          <div className="p-6 glass-card rounded-2xl space-y-3">
            <div className="text-xs font-medium text-secondary">Card Preview</div>
            <div 
              className="h-16 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: settings.colors.surface }}
            >
              <span className="text-xs" style={{ color: settings.colors.textSecondary }}>Surface</span>
            </div>
            <div 
              className="h-16 rounded-xl border flex items-center justify-center"
              style={{ borderColor: settings.colors.border }}
            >
              <span className="text-xs" style={{ color: settings.colors.textMuted }}>With Border</span>
            </div>
          </div>

          <div className="p-6 glass-card rounded-2xl space-y-3">
            <div className="text-xs font-medium text-secondary">Status Colors</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div 
                  className="h-8 rounded-lg mb-1" 
                  style={{ backgroundColor: settings.colors.success }}
                />
                <span className="text-xs" style={{ color: settings.colors.textMuted }}>Success</span>
              </div>
              <div className="text-center">
                <div 
                  className="h-8 rounded-lg mb-1" 
                  style={{ backgroundColor: settings.colors.warning }}
                />
                <span className="text-xs" style={{ color: settings.colors.textMuted }}>Warning</span>
              </div>
              <div className="text-center">
                <div 
                  className="h-8 rounded-lg mb-1" 
                  style={{ backgroundColor: settings.colors.error }}
                />
                <span className="text-xs" style={{ color: settings.colors.textMuted }}>Error</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-end">
        <button
          onClick={() => setSettings(DEFAULT_WHITE_LABEL)}
          className="px-6 py-3 glass-card rounded-xl hover:glass-hover transition-all text-secondary"
        >
          Reset to Defaults
        </button>
        <button
          onClick={() => {
            themeService.applyCustomColors(settings);
            localStorage.setItem('lp_settings', JSON.stringify(settings));
          }}
          className="px-6 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
          style={{ backgroundColor: settings.primaryColor, color: settings.colors.text }}
        >
          <Check size={18} />
          Save Settings
        </button>
      </div>
    </div>
  </motion.div>
);
