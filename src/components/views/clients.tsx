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
      className="max-w-4xl mx-auto space-y-8 py-12"
    >
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight text-primary">Clients</h1>
          <p className="text-secondary">Manage your client accounts.</p>
        </div>
        <button 
          onClick={() => setShowClientModal(true)}
          className="px-5 py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 bg-accent text-primary"
        >
          <Plus size={18} />
          Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl">
          <Users className="mx-auto text-tertiary mb-4" size={48} />
          <h3 className="text-lg font-medium text-secondary mb-2">No clients yet</h3>
          <p className="text-secondary mb-6">Add your first client to get started.</p>
          <button 
            onClick={() => setShowClientModal(true)}
            className="px-6 py-2.5 rounded-xl hover:opacity-90 transition-all bg-accent text-primary"
          >
            Add First Client
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map(client => (
            <div key={client.id} className="glass-card p-6 rounded-2xl hover:glass-hover transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">{client.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">{client.name}</h3>
                    <p className="text-sm text-secondary">{client.email}</p>
                    {client.company && <p className="text-sm text-tertiary">{client.company}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary">{client.totalAudits}</span>
                  <p className="text-xs text-tertiary uppercase">audits</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showClientModal && (
        <div className="fixed inset-0 glass-blur-overlay flex items-center justify-center z-50 p-4">
          <div className="glass-modal rounded-3xl p-8 w-full max-w-md space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-primary">Add New Client</h2>
              <button onClick={() => setShowClientModal(false)} className="text-tertiary hover:text-primary transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Name</label>
                <input 
                  type="text"
                  value={newClient.name}
                  onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-primary"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Email</label>
                <input 
                  type="email"
                  value={newClient.email}
                  onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-primary"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Company (Optional)</label>
                <input 
                  type="text"
                  value={newClient.company || ''}
                  onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-primary"
                  placeholder="Acme Inc"
                />
              </div>
            </div>
            <button 
              onClick={() => { addClient(); setShowClientModal(false); }}
              className="w-full py-3 rounded-xl hover:opacity-90 transition-all bg-accent text-primary"
            >
              Add Client
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
