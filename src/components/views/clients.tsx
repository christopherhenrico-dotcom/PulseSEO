/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, X } from 'lucide-react';
import { Client } from '../../types';

interface ClientsProps {
  clients: Client[];
  addClient: () => void;
  newClient: Partial<Client>;
  setNewClient: (client: Partial<Client>) => void;
}

export const Clients: React.FC<ClientsProps> = ({ clients, addClient, newClient, setNewClient }) => {
  const [showClientModal, setShowClientModal] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto space-y-8 py-8"
    >
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-light tracking-tight text-primary">Clients</h1>
          <p className="text-secondary text-sm">Manage your client accounts.</p>
        </div>
        <button 
          onClick={() => setShowClientModal(true)}
          className="px-5 py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 bg-primary text-white text-sm font-medium shadow-lg shadow-primary/20"
        >
          <Plus size={16} />
          Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl">
          <Users className="mx-auto text-tertiary mb-4" size={40} />
          <h3 className="text-lg font-medium text-primary mb-2">No clients yet</h3>
          <p className="text-secondary text-sm mb-6">Add your first client to get started.</p>
          <button 
            onClick={() => setShowClientModal(true)}
            className="px-6 py-2.5 rounded-xl hover:opacity-90 transition-all bg-primary text-white text-sm font-medium"
          >
            Add First Client
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {clients.map(client => (
            <div key={client.id} className="glass-card p-5 rounded-xl hover:glass-hover transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg glass flex items-center justify-center">
                    <span className="text-base font-semibold text-primary">{client.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary text-sm">{client.name}</h3>
                    <p className="text-xs text-secondary">{client.email}</p>
                    {client.company && <p className="text-xs text-tertiary">{client.company}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-primary">{client.totalAudits}</span>
                  <p className="text-[10px] text-tertiary uppercase tracking-wider">audits</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showClientModal && (
        <div className="fixed inset-0 glass-blur-overlay flex items-center justify-center z-50 p-4">
          <div className="glass-modal rounded-2xl p-8 w-full max-w-md space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-primary">Add New Client</h2>
              <button onClick={() => setShowClientModal(false)} className="text-tertiary hover:text-primary transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-tertiary mb-1.5 uppercase tracking-wider">Name</label>
                <input 
                  type="text"
                  value={newClient.name}
                  onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-primary text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-tertiary mb-1.5 uppercase tracking-wider">Email</label>
                <input 
                  type="email"
                  value={newClient.email}
                  onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-primary text-sm"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-tertiary mb-1.5 uppercase tracking-wider">Company (Optional)</label>
                <input 
                  type="text"
                  value={newClient.company || ''}
                  onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-primary text-sm"
                  placeholder="Acme Inc"
                />
              </div>
            </div>
            <button 
              onClick={() => { addClient(); setShowClientModal(false); }}
              className="w-full py-3 rounded-xl hover:opacity-90 transition-all bg-primary text-white text-sm font-medium"
            >
              Add Client
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
