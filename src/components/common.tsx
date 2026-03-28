/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Zap } from 'lucide-react';
import { WhiteLabelSettings } from '../types';

interface LogoProps {
  settings: WhiteLabelSettings;
  logoPreview: string | null;
}

export const LogoIcon: React.FC<LogoProps> = ({ settings, logoPreview }) => {
  if (settings.logoUrl && logoPreview) {
    return (
      <img 
        src={logoPreview} 
        alt="Logo" 
        style={{ height: settings.logoHeight, width: 'auto' }}
        className="object-contain rounded-xl"
      />
    );
  }
  return (
    <div 
      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/10"
      style={{ backgroundColor: settings.primaryColor }}
    >
      <Zap size={20} />
    </div>
  );
};

export const SmallLogoIcon: React.FC<LogoProps> = ({ settings, logoPreview }) => {
  if (settings.logoUrl && logoPreview) {
    const scaledHeight = Math.min(settings.logoHeight * 0.75, 48);
    return (
      <img 
        src={logoPreview} 
        alt="Logo" 
        style={{ height: scaledHeight, width: 'auto' }}
        className="object-contain rounded-lg"
      />
    );
  }
  return (
    <div 
      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg shadow-black/10"
      style={{ backgroundColor: settings.primaryColor }}
    >
      <Zap size={16} />
    </div>
  );
};
