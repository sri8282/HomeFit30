import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Flame, ArrowRight, Mail, ShieldCheck, RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react';
import { sendCode, verifyCode, isTimeoutError } from '../authService';
import { getErrorMessage } from '../dataService';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState<string>('');
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // 60-second resend countdown timer
  const [resendCountdown, setResendCountdown] = useState<number>(0);

  // References to the 6 code input boxes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Focus the first box when transitioning to code screen
  useEffect(() => {
    if (step === 'code') {
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Handle sending OTP code
  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setError('Please enter your email to continue.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setNotice(null);
    setIsLoading(true);

    try {
      await sendCode(trimmed);
      setIsLoading(false);
      setStep('code');
      setResendCountdown(60);
      setDigits(['', '', '', '', '', '']);
    } catch (err: any) {
      setIsLoading(false);
      // Check for timeout / 504 / Context deadline exceeded
      if (isTimeoutError(err)) {
        setStep('code');
        setError(null);
        setNotice('If you got a code, enter it below. Otherwise tap Resend.');
        setResendCountdown(60);
        setDigits(['', '', '', '', '', '']);
      } else {
        // Other errors (400, 429, 500): stay on email screen and show error
        setError(getErrorMessage(err));
      }
    }
  };

  // Handle resending code
  const handleResendCode = async () => {
    if (resendCountdown > 0 || isLoading || isVerifying) return;
    setError(null);
    setNotice(null);
    setIsLoading(true);

    try {
      await sendCode(email.trim());
      setIsLoading(false);
      setResendCountdown(60);
      setNotice('New code sent! Check your inbox.');
    } catch (err: any) {
      setIsLoading(false);
      if (isTimeoutError(err)) {
        setNotice('If you got a code, enter it below. Otherwise tap Resend.');
        setResendCountdown(60);
      } else {
        setError(getErrorMessage(err));
      }
    }
  };

  // Handle verifying 6-digit OTP code
  const handleVerifyCode = async (codeToVerify?: string) => {
    const fullCode = (codeToVerify ?? digits.join('')).trim();
    if (fullCode.length !== 6 || isVerifying) return;

    setError(null);
    setIsVerifying(true);

    try {
      await verifyCode(email.trim(), fullCode);
      setIsVerifying(false);
      onLoginSuccess();
    } catch (err: any) {
      setIsVerifying(false);
      // Wrong or expired code: shake boxes, show "Wrong or expired code", clear boxes
      setIsShaking(true);
      setError('Wrong or expired code');
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        setIsShaking(false);
        inputRefs.current[0]?.focus();
      }, 500);
    }
  };

  // Single digit typing
  const handleDigitChange = (index: number, val: string) => {
    if (isVerifying) return;
    const clean = val.replace(/\D/g, '');

    if (!clean) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    const char = clean.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    if (error) setError(null);

    // Auto-jump to next box
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Automatically call verifyCode when all 6 digits are filled
    const full = newDigits.join('');
    if (full.length === 6) {
      handleVerifyCode(full);
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isVerifying) return;
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Support pasting full 6 digits
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (isVerifying) return;
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    if (error) setError(null);

    if (pasted.length === 6) {
      inputRefs.current[5]?.focus();
      handleVerifyCode(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
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
          {step === 'email'
            ? 'Sign in to access your customized home workout program and track your daily streaks.'
            : `Enter the 6-digit code sent to ${email}`}
        </p>
      </div>

      {/* Center Email or Code Screen */}
      {step === 'email' ? (
        <motion.form
          key="email-form"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          onSubmit={handleSendCode}
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
        </motion.form>
      ) : (
        <motion.div
          key="code-form"
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="my-auto py-6 space-y-5"
        >
          {/* Header Row with Change Email Link */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Verification Code
            </span>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setError(null);
                setNotice(null);
                setDigits(['', '', '', '', '', '']);
              }}
              className="text-xs text-slate-400 hover:text-[#A3E635] flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change email</span>
            </button>
          </div>

          {/* Optional notice if timeout occurred or resend sent */}
          {notice && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>{notice}</span>
            </div>
          )}

          {/* 6 Separate Boxes with auto-jump, paste, and shake on error */}
          <motion.div
            animate={isShaking ? { x: [-12, 12, -8, 8, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-between items-center gap-2 max-w-[340px] mx-auto py-1"
          >
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                disabled={isVerifying}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                autoFocus={idx === 0}
                className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-2xl font-black rounded-2xl bg-slate-900 border-2 transition-all text-white focus:outline-none ${
                  error
                    ? 'border-rose-500/80 ring-2 ring-rose-500/20'
                    : digit
                    ? 'border-[#A3E635] ring-2 ring-[#A3E635]/20'
                    : 'border-slate-800 focus:border-[#A3E635] focus:ring-2 focus:ring-[#A3E635]/20'
                } ${isVerifying ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            ))}
          </motion.div>

          {/* Error Message */}
          {error && (
            <p className="text-xs text-rose-400 font-medium text-center">
              {error}
            </p>
          )}

          {/* Loading Spinner while verifying */}
          {isVerifying && (
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#A3E635] pt-1">
              <div className="w-4 h-4 border-2 border-[#A3E635] border-t-transparent rounded-full animate-spin" />
              <span>Verifying code...</span>
            </div>
          )}

          {/* Resend Code with 60-Second Countdown */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">Didn't get a code?</span>
            <button
              type="button"
              disabled={resendCountdown > 0 || isLoading || isVerifying}
              onClick={handleResendCode}
              className="text-[#A3E635] disabled:text-slate-500 hover:underline cursor-pointer disabled:cursor-not-allowed font-medium flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>
                {resendCountdown > 0
                  ? `Resend code in ${resendCountdown}s`
                  : 'Resend code'}
              </span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Bottom CTA Button & Security Badge */}
      <div className="pt-4 space-y-3">
        {step === 'email' ? (
          <button
            type="button"
            onClick={handleSendCode}
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-[#A3E635] hover:bg-[#b0f242] active:scale-[0.98] text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(163,230,53,0.35)] transition-all cursor-pointer font-display disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Send Code</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleVerifyCode()}
            disabled={digits.join('').length !== 6 || isVerifying}
            className="w-full h-14 rounded-2xl bg-[#A3E635] hover:bg-[#b0f242] active:scale-[0.98] text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(163,230,53,0.35)] transition-all cursor-pointer font-display disabled:opacity-50"
          >
            {isVerifying ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Verify & Continue</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-[#A3E635]" />
          <span>Secure Passwordless OTP Login · Supabase Auth</span>
        </div>
      </div>
    </div>
  );
};
