import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#080d1a] flex items-center justify-center sm:py-6 p-0 overscroll-none">
      {/* Outer Phone Shell: On mobile, respects native safe area insets; on desktop, shows phone frame with mock status bar */}
      <div className="relative w-full sm:w-[390px] h-[100dvh] sm:h-[844px] bg-[#0F172A] sm:rounded-[48px] sm:shadow-[0_25px_70px_rgba(0,0,0,0.85)] sm:border-[8px] sm:border-slate-800/80 overflow-hidden flex flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
        {/* Dynamic Island / Top Speaker Notch ONLY on Desktop (real phone has native status bar) */}
        <div className="shrink-0 w-full pt-3 px-6 hidden sm:flex items-center justify-between text-xs text-slate-400 select-none z-30">
          <span className="font-semibold text-[13px] tracking-tight text-white">9:41</span>

          {/* Dynamic Island pill */}
          <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center space-x-1.5 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900/80" />
          </div>

          <div className="flex items-center space-x-1.5 text-white">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4 text-[#A3E635]" />
          </div>
        </div>

        {/* Inner Phone Viewport Content */}
        <div className="flex-1 w-full relative overflow-y-auto overflow-x-hidden flex flex-col no-scrollbar overscroll-none">
          {children}
        </div>

        {/* Home Indicator Bar ONLY on Desktop (real phone has native home indicator) */}
        <div className="shrink-0 w-full h-5 hidden sm:flex items-center justify-center pb-1 pointer-events-none z-30">
          <div className="w-32 h-1 bg-white/30 rounded-full" />
        </div>
      </div>
    </div>
  );
};
