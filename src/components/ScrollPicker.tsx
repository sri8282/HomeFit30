import React, { useRef, useEffect, useCallback } from 'react';
import { Minus, Plus } from 'lucide-react';

interface ScrollPickerProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  label?: string;
  onChange: (val: number) => void;
}

export const ScrollPicker: React.FC<ScrollPickerProps> = ({
  value,
  min,
  max,
  step = 1,
  unit,
  label = '',
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollSettleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // References for press-and-hold repeating
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentValueRef = useRef<number>(value);
  currentValueRef.current = value;

  const itemHeight = 44; // px height of each item in the vertical scroll picker

  // Generate range of selectable values
  const items: number[] = [];
  for (let v = min; v <= max; v += step) {
    items.push(v);
  }

  // Scroll to a specific value
  const scrollToValue = useCallback(
    (targetVal: number, behavior: ScrollBehavior = 'smooth') => {
      if (!containerRef.current) return;
      const index = items.indexOf(targetVal);
      if (index >= 0) {
        isProgrammaticScrollRef.current = true;
        if (scrollSettleTimeoutRef.current) {
          clearTimeout(scrollSettleTimeoutRef.current);
        }

        const targetScroll = index * itemHeight;
        containerRef.current.scrollTo({
          top: targetScroll,
          behavior,
        });

        // Clear programmatic scroll flag after animation completes
        scrollSettleTimeoutRef.current = setTimeout(
          () => {
            isProgrammaticScrollRef.current = false;
          },
          behavior === 'smooth' ? 300 : 50
        );
      }
    },
    [items, itemHeight]
  );

  // Sync scroll position whenever value changes externally
  useEffect(() => {
    scrollToValue(value, 'smooth');
  }, [value, scrollToValue]);

  // Clean up any running timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      if (scrollSettleTimeoutRef.current) clearTimeout(scrollSettleTimeoutRef.current);
    };
  }, []);

  // Handle native user scroll / swipe
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isProgrammaticScrollRef.current) return;

    const scrollTop = e.currentTarget.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    if (index >= 0 && index < items.length) {
      const selectedValue = items[index];
      if (selectedValue !== value) {
        onChange(selectedValue);
      }
    }
  };

  // Step change helper
  const performStep = useCallback(
    (direction: 1 | -1, isFastHold = false) => {
      const current = currentValueRef.current;
      const nextVal = current + direction * step;
      if (nextVal >= min && nextVal <= max) {
        onChange(nextVal);
        scrollToValue(nextVal, isFastHold ? 'auto' : 'smooth');
      }
    },
    [min, max, step, onChange, scrollToValue]
  );

  // Stop hold timers
  const stopHold = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  // Start hold for continuous fast changing
  const startHold = useCallback(
    (direction: 1 | -1) => {
      stopHold();
      // First immediate trigger on press
      performStep(direction, false);

      // After 260ms delay, begin fast repeating every 55ms
      holdTimeoutRef.current = setTimeout(() => {
        holdIntervalRef.current = setInterval(() => {
          performStep(direction, true);
        }, 55);
      }, 260);
    },
    [performStep, stopHold]
  );

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Header Label and Big Number Display */}
      <div className="text-center mb-3">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{label}</span>
        <div className="flex items-baseline justify-center space-x-2 mt-1">
          <span className="text-5xl font-extrabold text-[#A3E635] tracking-tight tabular-nums font-display drop-shadow-[0_4px_12px_rgba(163,230,53,0.3)]">
            {value}
          </span>
          <span className="text-lg font-bold text-slate-300">{unit}</span>
        </div>
      </div>

      {/* Main Wheel Container with Side -/+ Controls */}
      <div className="w-full flex items-center justify-between gap-3 px-2">
        {/* Precision Minus Button (Supports Tap and Fast Hold) */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            if (value > min) startHold(-1);
          }}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="w-12 h-12 shrink-0 rounded-2xl bg-slate-800/90 hover:bg-slate-700/80 active:scale-90 active:bg-slate-700 disabled:opacity-25 disabled:pointer-events-none text-white flex items-center justify-center border border-slate-700/60 transition-all cursor-pointer shadow-md touch-manipulation"
        >
          <Minus className="w-5 h-5 text-slate-200 stroke-[2.5]" />
        </button>

        {/* Tactile Scroll Wheel */}
        <div className="relative flex-1 h-[176px] bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-inner flex justify-center">
          {/* Top Fade Gradient Scrim */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0F172A] to-transparent z-10" />

          {/* Center Selection Lens */}
          <div className="pointer-events-none absolute inset-x-3 top-1/2 -translate-y-1/2 h-[44px] rounded-xl border-y border-[#A3E635]/40 bg-[#A3E635]/10 z-10 flex items-center justify-between px-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#A3E635]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#A3E635]" />
          </div>

          {/* Bottom Fade Gradient Scrim */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0F172A] to-transparent z-10" />

          {/* Scrollable Items Container */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="w-full h-full overflow-y-scroll no-scrollbar py-[66px] snap-y snap-mandatory select-none cursor-grab active:cursor-grabbing"
          >
            {items.map((item) => {
              const isSelected = item === value;
              const distance = Math.abs(item - value);

              return (
                <div
                  key={item}
                  onClick={() => {
                    onChange(item);
                    scrollToValue(item, 'smooth');
                  }}
                  className={`h-[44px] flex items-center justify-center snap-center transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'text-2xl font-bold text-[#A3E635] scale-110'
                      : distance === 1
                      ? 'text-lg font-medium text-slate-400 opacity-60'
                      : 'text-sm font-normal text-slate-600 opacity-25'
                  }`}
                >
                  <span className="tabular-nums">{item}</span>
                  {isSelected && <span className="text-xs font-semibold ml-1 text-[#A3E635]/80">{unit}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Precision Plus Button (Supports Tap and Fast Hold) */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            if (value < max) startHold(1);
          }}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="w-12 h-12 shrink-0 rounded-2xl bg-slate-800/90 hover:bg-slate-700/80 active:scale-90 active:bg-slate-700 disabled:opacity-25 disabled:pointer-events-none text-white flex items-center justify-center border border-slate-700/60 transition-all cursor-pointer shadow-md touch-manipulation"
        >
          <Plus className="w-5 h-5 text-slate-200 stroke-[2.5]" />
        </button>
      </div>

      {/* Graduation Ruler Marks Hint */}
      <div className="w-full flex justify-between px-16 text-[10px] text-slate-500 font-mono mt-2">
        <span>Min {min}</span>
        <span>Hold to fast scroll</span>
        <span>Max {max}</span>
      </div>
    </div>
  );
};
