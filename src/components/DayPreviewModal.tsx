import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Clock, Flame, Dumbbell } from 'lucide-react';
import {
  DayWorkout,
  calculateDayEstimatedMinutes,
  calculateExerciseEstimatedSeconds,
  formatExerciseEstimatedTime,
} from '../dataService';

interface DayPreviewModalProps {
  workout: DayWorkout | null;
  onClose: () => void;
  onStartWorkout: (workout: DayWorkout) => void;
}

export const DayPreviewModal: React.FC<DayPreviewModalProps> = ({
  workout,
  onClose,
  onStartWorkout,
}) => {
  if (!workout) return null;

  const totalEstimatedTime = calculateDayEstimatedMinutes(workout.exercises);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative z-10 w-full sm:max-w-[390px] h-[88vh] sm:h-[750px] bg-[#0F172A] rounded-t-[32px] sm:rounded-[36px] border-t sm:border border-slate-800 p-5 flex flex-col justify-between shadow-2xl overflow-hidden"
        >
          {/* Top Bar with Grab Handle & Close */}
          <div className="shrink-0 mb-3">
            <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#A3E635] bg-[#A3E635]/10 px-2.5 py-1 rounded-full border border-[#A3E635]/20">
                Workout Preview
              </span>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Top: Day Number & Focus */}
            <h2 className="text-2xl font-black text-white font-display mt-2 tracking-tight">
              Day {workout.day} · {workout.focusLabel || workout.targetFocus || 'Chest'}
            </h2>
            <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
              {workout.subtitle || workout.title}
            </p>

            {/* Top Stats Banner: Estimated Time, Number of Exercises, Estimated Calories */}
            <div className="grid grid-cols-3 gap-2 mt-3.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
              {/* Stat 1: Total Estimated Time */}
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-1 text-[#A3E635] mb-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-sm font-black font-display tracking-tight">
                    {totalEstimatedTime} min
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Est. Time
                </span>
              </div>

              {/* Stat 2: Number of Exercises */}
              <div className="flex flex-col items-center text-center border-x border-slate-800/80">
                <div className="flex items-center gap-1 text-white mb-0.5">
                  <Dumbbell className="w-3.5 h-3.5 text-[#A3E635]" />
                  <span className="text-sm font-black font-display tracking-tight">
                    {workout.exercises.length}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Exercises
                </span>
              </div>

              {/* Stat 3: Estimated Calories */}
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-1 text-amber-400 mb-0.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span className="text-sm font-black font-display tracking-tight">
                    {workout.estimatedCalories}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Calories
                </span>
              </div>
            </div>
          </div>

          {/* List of Exercises */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 py-1 pr-0.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1">
              <span>Exercise Routine</span>
              <span>Reps & Duration</span>
            </div>

            {workout.exercises.map((ex, idx) => {
              const exSeconds = calculateExerciseEstimatedSeconds(ex);
              const exFormattedTime = formatExerciseEstimatedTime(exSeconds);
              const AnimationComp = ex.animation;

              return (
                <div
                  key={ex.id || idx}
                  className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 transition-colors"
                >
                  {/* Small Looping Animation Thumbnail */}
                  <div className="w-13 h-13 rounded-xl bg-slate-950 border border-slate-800/80 shrink-0 overflow-hidden flex items-center justify-center p-1 shadow-inner">
                    {AnimationComp ? (
                      <AnimationComp className="w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#A3E635]">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  {/* Exercise Name & Target Muscle */}
                  <div className="flex-1 min-w-0 pr-1">
                    <h4 className="text-xs font-bold text-white font-display truncate">
                      {ex.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 capitalize truncate block">
                      {ex.targetArea || ex.targetMuscle}
                    </span>
                  </div>

                  {/* Reps or Seconds + That Exercise's Estimated Time */}
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-[#A3E635] font-display">
                      {ex.sets && ex.sets > 1 ? `${ex.sets} × ` : ''}
                      {ex.reps
                        ? `${ex.reps} reps`
                        : `${ex.durationSeconds || ex.seconds}s`}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      <span>{exFormattedTime}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom "Start Workout" Button */}
          <div className="shrink-0 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => onStartWorkout(workout)}
              className="w-full h-13 rounded-2xl bg-[#A3E635] hover:bg-[#b0f242] active:scale-[0.98] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(163,230,53,0.35)] transition-all cursor-pointer font-display"
            >
              <Play className="w-4 h-4 fill-slate-950 stroke-none" />
              <span>Start Workout</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
