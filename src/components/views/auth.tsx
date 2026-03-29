import React, { useState } from 'react';
import { Mail, Lock, User, Building2, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api';

interface AuthViewProps {
  onSuccess: (user: any) => void;
  onBack: () => void;
}

export function LoginView({ onSuccess, onBack }: AuthViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const response = await api.login(email, password);
    
    if (response.data) {
      api.setToken(response.data.accessToken);
      onSuccess(response.data.user);
    } else {
      setError(response.error || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl p-8 border border-white/5">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary mb-2">Welcome Back</h1>
            <p className="text-secondary">Sign in to your PulseSEO account</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-secondary mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-primary focus:border-primary focus:outline-none"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-secondary mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-primary focus:border-primary focus:outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white rounded-lg py-2.5 font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-secondary text-sm mt-6">
            Don't have an account?{' '}
            <button onClick={onBack} className="text-primary hover:underline">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export function RegisterView({ onSuccess, onBack }: AuthViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const response = await api.register(email, password, name, company || undefined);
    
    if (response.data) {
      api.setToken(response.data.accessToken);
      onSuccess(response.data.user);
    } else {
      setError(response.error || 'Registration failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl p-8 border border-white/5">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary mb-2">Create Account</h1>
            <p className="text-secondary">Start your SEO audit journey today</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-secondary mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-primary focus:border-primary focus:outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-secondary mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-primary focus:border-primary focus:outline-none"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-secondary mb-1">Company (Optional)</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-primary focus:border-primary focus:outline-none"
                  placeholder="Your Company"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-secondary mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-primary focus:border-primary focus:outline-none"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-tertiary mt-1">Minimum 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white rounded-lg py-2.5 font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-secondary text-sm mt-6">
            Already have an account?{' '}
            <button onClick={onBack} className="text-primary hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
