/**
 * PulseSEO API Client
 * Handles all communication with the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiConfig {
  baseUrl: string;
  token?: string;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl;
    this.token = config.token || localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          error: data?.error || `HTTP ${response.status}`,
          status: response.status,
        };
      }

      return { data, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string, company?: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, company }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(data: any) {
    return this.request('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // Audit endpoints
  async getAudits(params?: { page?: number; limit?: number; search?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request(`/audits${query ? `?${query}` : ''}`);
  }

  async getAudit(id: string) {
    return this.request(`/audits/${id}`);
  }

  async createAudit(data: any) {
    return this.request('/audits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createBulkAudits(businesses: any[]) {
    return this.request('/audits/bulk', {
      method: 'POST',
      body: JSON.stringify({ businesses }),
    });
  }

  async deleteAudit(id: string) {
    return this.request(`/audits/${id}`, { method: 'DELETE' });
  }

  async getAuditStats() {
    return this.request('/audits/stats/summary');
  }

  // Client endpoints
  async getClients(params?: { search?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request(`/clients${query ? `?${query}` : ''}`);
  }

  async getClient(id: string) {
    return this.request(`/clients/${id}`);
  }

  async createClient(data: any) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id: string, data: any) {
    return this.request(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: string) {
    return this.request(`/clients/${id}`, { method: 'DELETE' });
  }

  // Team endpoints
  async getTeamMembers() {
    return this.request('/team/members');
  }

  async inviteTeamMember(email: string, role: string) {
    return this.request('/team/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  async removeTeamMember(id: string) {
    return this.request(`/team/members/${id}`, { method: 'DELETE' });
  }

  // Reports endpoints
  async getReports() {
    return this.request('/reports');
  }

  async generateReport(data: any) {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async scheduleReport(data: any) {
    return this.request('/reports/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Billing endpoints
  async getPlans() {
    return this.request('/billing/plans');
  }

  async getSubscription() {
    return this.request('/billing/subscription');
  }

  async createCheckoutSession(planId: string) {
    return this.request('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  }

  async getUsage() {
    return this.request('/billing/usage');
  }

  // Settings endpoints
  async getSettings() {
    return this.request('/settings');
  }

  async updateBranding(data: any) {
    return this.request('/settings/branding', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getApiKeys() {
    return this.request('/settings/api');
  }

  async generateApiKey(name: string) {
    return this.request('/settings/api/keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  // Analytics endpoints
  async getDashboardAnalytics() {
    return this.request('/analytics/dashboard');
  }

  async getTrends(period: string) {
    return this.request(`/analytics/trends?period=${period}`);
  }

  // Scheduled audits
  async getScheduledAudits() {
    return this.request('/scheduled');
  }

  async createScheduledAudit(data: any) {
    return this.request('/scheduled', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async toggleScheduledAudit(id: string) {
    return this.request(`/scheduled/${id}/toggle`, { method: 'POST' });
  }
}

// Export singleton instance
export const api = new ApiClient({ baseUrl: API_BASE_URL });

// Export class for custom instances
export { ApiClient };
export type { ApiResponse };
