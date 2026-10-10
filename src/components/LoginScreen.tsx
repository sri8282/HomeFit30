import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Flame, ArrowRight, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { login } from '../authService';
import { saveUserProfile } from '../dataService';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setError('Please enter your email to continue.');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Login exclusively via authService
      login(trimmed);
      saveUserProfile({ email: trimmed });

      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess();
      }, 350);
    } catch (err) {
      setIsLoading(false);
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between bg-[#0F172A] text-white p-6 relative overflow-y-auto no-scrollbar select-none">
      {/* Top Branding Section */}
      <div className="pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A3E635]/15 border border-[#A3E635]/30 mb-6">
          <Flame className="w-3.5 h-3.5 text-[#A3E635]" />
          <span className="text-[11px] font-bold tracking-wider text-[#A3E635] uppercase">
            HomeFit 30 Access
          </span>
        </div>

        <h1 className="text-4xl font-black tracking-tight leading-[1.08] text-white font-display mb-2">
          Transform in <br />
          <span className="text-[#A3E635]">30 Days</span>
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-[280px]">
          Sign in to access your customized home workout program and track your daily streaks.
        </p>
      </div>

      {/* Center Email Form */}
      <motion.form
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onSubmit={handleSubmit}
        className="my-auto py-6 space-y-4"
      >
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Email Address
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              <Mail className="w-5 h-5" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              className="w-full h-14 pl-12 pr-4 bg-slate-900 border-2 border-slate-800 rounded-2xl text-white placeholder-slate-500 font-medium text-base focus:outline-none focus:border-[#A3E635] focus:ring-2 focus:ring-[#A3E635]/20 transition-all"
            />
          </div>
          {error && (
            <p className="text-xs text-rose-400 font-medium pl-1 pt-0.5">
              {error}
            </p>
          )}
        </div>

        {/* Quick demo autofill suggestion */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>Quick test:</span>
          <button
            type="button"
            onClick={() => {
              setEmail('athlete@homefit30.app');
              setError(null);
            }}
            className="text-[#A3E635] hover:underline cursor-pointer font-medium"
          >
            athlete@homefit30.app
          </button>
        </div>
      </motion.form>

      {/* Bottom CTA Button & Security Badge */}
      <div className="pt-4 space-y-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full h-14 rounded-2xl bg-[#A3E635] hover:bg-[#b0f242] active:scale-[0.98] text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(163,230,53,0.35)] transition-all cursor-pointer font-display disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-[#A3E635]" />
          <span>Local storage session · Ready for Supabase Auth</span>
        </div>
      </div>
    </div>
  );
};
