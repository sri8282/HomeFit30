import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  CheckCircle2,
  Trophy,
  Flame,
  Clock,
  ArrowRight,
  Plus,
  Sparkles,
  Layers,
} from 'lucide-react';
import { DayWorkout, Exercise, markDayCompleted, getRestTimeSetting } from '../dataService';
import { soundManager } from '../soundService';
import { Confetti } from './Confetti';

interface WorkoutPlayerProps {
  workout: DayWorkout;
  onClose: () => void;
  onFinishWorkout: () => void;
}

export const WorkoutPlayer: React.FC<WorkoutPlayerProps> = ({
  workout,
  onClose,
  onFinishWorkout,
}) => {
  // Navigation & Exercise State
  const [exerciseIndex, setExerciseIndex] = useState<number>(0);

  // 3-second "Get Ready" countdown state
  const [isGettingReady, setIsGettingReady] = useState<boolean>(true);
  const [getReadySeconds, setGetReadySeconds] = useState<number>(3);

  // Rest Screen state (configured by user settings)
  const configuredRest = getRestTimeSetting();
  const [isResting, setIsResting] = useState<boolean>(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(configuredRest);

  // Active Exercise Timer
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Completion State
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [totalElapsedTime, setTotalElapsedTime] = useState<number>(0);

  const currentExercise: Exercise | undefined = workout.exercises[exerciseIndex];
  const isLastExercise = exerciseIndex === workout.exercises.length - 1;
  const isFirstExercise = exerciseIndex === 0;

  // Track overall session time
  useEffect(() => {
    if (isCompleted || isPaused) return;
    const timer = setInterval(() => {
      setTotalElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted, isPaused]);

  // Synchronize exercise duration whenever active exercise changes
  useEffect(() => {
    if (currentExercise?.durationSeconds) {
      setSecondsLeft(currentExercise.durationSeconds);
    } else {
      setSecondsLeft(0);
    }
  }, [exerciseIndex, currentExercise]);

  // ==========================================
  // 1. 3-SECOND "GET READY" COUNTDOWN
  // ==========================================
  useEffect(() => {
    if (!isGettingReady || isCompleted) return;

    if (getReadySeconds <= 0) {
      // Countdown finished -> Start active exercise
      setIsGettingReady(false);
      soundManager.playGoBeep();
      return;
    }

    // Play countdown tick
    soundManager.playCountdownTick();

    const timer = setInterval(() => {
      setGetReadySeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isGettingReady, getReadySeconds, isCompleted]);

  // ==========================================
  // 2. ACTIVE EXERCISE COUNTDOWN (TIMED EXERCISES)
  // ==========================================
  useEffect(() => {
    if (isPaused || isResting || isGettingReady || isCompleted) return;
    if (!currentExercise?.durationSeconds) return;

    if (secondsLeft <= 0) {
      handleExerciseDone();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 4 && prev > 1) {
          soundManager.playCountdownTick();
        } else if (prev === 1) {
          soundManager.playGoBeep();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, isPaused, isResting, isGettingReady, isCompleted, currentExercise]);

  // ==========================================
  // 3. 20-SECOND REST SCREEN COUNTDOWN
  // ==========================================
  useEffect(() => {
    if (!isResting || isPaused || isCompleted) return;

    if (restSecondsLeft <= 0) {
      // Finish rest -> trigger 3-second Get Ready for next exercise
      finishRestAndStartNext();
      return;
    }

    const timer = setInterval(() => {
      setRestSecondsLeft((prev) => {
        if (prev <= 4 && prev > 1) {
          soundManager.playCountdownTick();
        } else if (prev === 1) {
          soundManager.playGoBeep();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isResting, restSecondsLeft, isPaused, isCompleted]);

  // Transition from rest to next exercise with 3-second Get Ready
  const finishRestAndStartNext = () => {
    setIsResting(false);
    setExerciseIndex((prev) => prev + 1);
    setGetReadySeconds(3);
    setIsGettingReady(true);
  };

  // Called when exercise is completed (either countdown hits 0 or user taps done)
  const handleExerciseDone = () => {
    if (isLastExercise) {
      triggerWorkoutCompletion();
    } else {
      // Transition to rest screen with user's configured rest time
      setRestSecondsLeft(getRestTimeSetting());
      setIsResting(true);
    }
  };

  // Skip current exercise
  const handleSkipExercise = () => {
    handleExerciseDone();
  };

  // Go to previous exercise
  const handlePreviousExercise = () => {
    if (exerciseIndex > 0) {
      setIsResting(false);
      setIsGettingReady(true);
      setGetReadySeconds(3);
      setExerciseIndex((prev) => prev - 1);
    }
  };

  // Skip 3s Get Ready countdown immediately
  const handleSkipGetReady = () => {
    setIsGettingReady(false);
    soundManager.playGoBeep();
  };

  // Skip 20s rest screen immediately
  const handleSkipRest = () => {
    finishRestAndStartNext();
  };

  // Add 10s extra rest
  const handleAddRestTime = () => {
    setRestSecondsLeft((prev) => prev + 10);
  };

  // Workout Completion & Persist to dataService.ts
  const triggerWorkoutCompletion = () => {
    setIsCompleted(true);
    soundManager.playSuccessChime();

    const durationMinutes = Math.max(1, Math.round(totalElapsedTime / 60));
    const caloriesBurned = workout.estimatedCalories;

    // Persist via dataService
    markDayCompleted(workout.day, {
      durationMinutes,
      caloriesBurned,
    });
  };

  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // ========================================================
  // VIEW A: CELEBRATION SCREEN (CONFETTI, TOTAL TIME, CALORIES)
  // ========================================================
  if (isCompleted) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F172A] flex flex-col justify-between p-6 overflow-hidden">
        {/* Full Screen Falling Confetti Component */}
        <Confetti />

        <div className="flex-1 flex flex-col items-center justify-center text-center z-30">
          <motion.div
            initial={{ scale: 0.2, rotate: -25, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 10, stiffness: 120 }}
            className="w-24 h-24 rounded-3xl bg-[#A3E635] text-slate-950 flex items-center justify-center shadow-[0_0_50px_rgba(163,230,53,0.5)] mb-6"
          >
            <Trophy className="w-12 h-12 stroke-[2.5]" />
          </motion.div>

          <span className="text-xs font-extrabold uppercase tracking-widest text-[#A3E635] mb-1">
            Day {workout.day} Complete
          </span>
          <h1 className="text-3xl font-black text-white font-display">
            Workout Completed! 🎉
          </h1>
          <p className="text-slate-300 text-sm mt-1.5 max-w-[280px]">
            Outstanding consistency! Today's session is recorded and your 30-day streak is growing.
          </p>

          {/* Stat summary cards */}
          <div className="grid grid-cols-2 gap-3.5 w-full max-w-[320px] mt-8">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-lg">
              <Clock className="w-5 h-5 text-[#A3E635] mx-auto mb-1.5" />
              <span className="text-2xl font-black text-white font-display tabular-nums">
                {formatTime(totalElapsedTime)}
              </span>
              <p className="text-[11px] text-slate-400 uppercase font-semibold mt-0.5">Total Time</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-lg">
              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1.5" />
              <span className="text-2xl font-black text-[#A3E635] font-display tabular-nums">
                {workout.estimatedCalories} kcal
              </span>
              <p className="text-[11px] text-slate-400 uppercase font-semibold mt-0.5">Calories Burned</p>
            </div>
          </div>
        </div>

        <div className="pt-4 z-30">
          <button
            type="button"
            onClick={onFinishWorkout}
            className="w-full h-14 rounded-2xl bg-[#A3E635] hover:bg-[#b0f242] text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(163,230,53,0.35)] transition-all cursor-pointer font-display active:scale-[0.98]"
          >
            <span>Back to 30-Day Plan</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW B: 3-SECOND "GET READY" COUNTDOWN
  // ========================================================
  if (isGettingReady) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F172A] flex flex-col justify-between p-6 text-center select-none">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A3E635]">
            Exercise {exerciseIndex + 1} of {workout.exercises.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center Countdown Pulse */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Get Ready
          </span>

          <motion.div
            key={getReadySeconds}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="text-8xl font-black text-[#A3E635] font-display tabular-nums drop-shadow-[0_0_35px_rgba(163,230,53,0.4)]"
          >
            {getReadySeconds}
          </motion.div>

          <div className="mt-8 p-4 rounded-3xl bg-slate-900 border border-slate-800 w-full max-w-[320px] flex items-center justify-between gap-3 text-left">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">First Move</span>
              <h3 className="text-base font-black text-white font-display mt-0.5">
                {currentExercise?.name}
              </h3>
              <span className="inline-block mt-1 text-xs font-bold text-[#A3E635] bg-[#A3E635]/10 px-2.5 py-0.5 rounded-full">
                {currentExercise?.durationSeconds
                  ? `${currentExercise.durationSeconds} Seconds`
                  : `${currentExercise?.reps} Reps`}
              </span>
            </div>
            {currentExercise?.animation && (
              <div className="w-20 h-16 shrink-0 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center overflow-hidden p-1">
                <currentExercise.animation className="w-full h-full" />
              </div>
            )}
          </div>
        </div>

        {/* Skip Countdown CTA */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleSkipGetReady}
            className="w-full h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <span>Skip Countdown & Start</span>
            <Play className="w-3.5 h-3.5 text-[#A3E635]" />
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW C: 20-SECOND REST SCREEN (SHOWING NEXT EXERCISE)
  // ========================================================
  if (isResting) {
    const nextExercise = workout.exercises[exerciseIndex + 1];

    return (
      <div className="fixed inset-0 z-50 bg-[#0F172A] flex flex-col justify-between p-6 select-none">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A3E635]">
            Recovery Period
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Rest Timer & Next Exercise Preview */}
        <div className="flex-1 flex flex-col items-center justify-center text-center my-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
            Rest & Breathe
          </span>
          <div className="text-7xl font-black text-[#A3E635] font-display tabular-nums drop-shadow-[0_0_25px_rgba(163,230,53,0.3)] mb-4">
            {restSecondsLeft}s
          </div>

          <button
            type="button"
            onClick={handleAddRestTime}
            className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 mb-6 flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-[#A3E635]" />
            <span>+10 Seconds</span>
          </button>

          {/* Up Next Preview Card */}
          {nextExercise && (
            <div className="w-full max-w-[320px] p-4 rounded-3xl bg-slate-900 border border-slate-800 text-left shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Up Next ({exerciseIndex + 2}/{workout.exercises.length})
              </span>
              <h4 className="text-base font-black text-white font-display mt-0.5">
                {nextExercise.name}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">{nextExercise.targetMuscle}</p>

              {/* Mini Animation Preview in Rest Card */}
              {nextExercise.animation ? (
                <div className="mt-3 w-full h-20 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between p-2 overflow-hidden">
                  <div className="w-20 h-full flex items-center justify-center shrink-0">
                    <nextExercise.animation className="w-full h-full" />
                  </div>
                  <div className="text-right pr-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target</span>
                    <span className="text-xs font-bold text-[#A3E635] capitalize">{nextExercise.targetArea || nextExercise.targetMuscle}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 w-full h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center gap-2">
                  <Layers className="w-4 h-4 text-[#A3E635]" />
                  <span className="text-[11px] font-mono text-slate-400">
                    {nextExercise.durationSeconds
                      ? `${nextExercise.durationSeconds} Seconds`
                      : `${nextExercise.reps} Reps`}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Skip Rest CTA */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleSkipRest}
            className="w-full h-13 rounded-2xl bg-[#A3E635] hover:bg-[#b0f242] text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer font-display active:scale-[0.98]"
          >
            <span>Skip Rest & Next Move</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW D: ACTIVE EXERCISE SCREEN (WITH ANIMATION PLACEHOLDER)
  // ========================================================
  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A] flex flex-col justify-between p-5 overflow-y-auto no-scrollbar">
      {/* Top Header & Exercise Progress Bar */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700/60 cursor-pointer"
            aria-label="Exit workout"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center">
            <span className="text-xs font-extrabold text-white uppercase tracking-wider font-display">
              Day {workout.day} · {workout.title.split(':')[1]?.trim() || workout.title}
            </span>
          </div>

          <div className="text-xs font-mono font-bold text-[#A3E635] bg-[#A3E635]/15 px-2.5 py-1 rounded-full border border-[#A3E635]/30">
            {exerciseIndex + 1}/{workout.exercises.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#A3E635] transition-all duration-300"
            style={{
              width: `${((exerciseIndex + 1) / workout.exercises.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-2 text-center my-auto">
        {/* Large Exercise Animation Card */}
        <div className="relative w-full h-56 sm:h-64 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-3 overflow-hidden shadow-2xl group">
          {/* Subtle neon glow in corner */}
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#A3E635]/15 blur-2xl pointer-events-none" />

          {/* Real Looping Stick Figure Animation Component */}
          {currentExercise?.animation ? (
            <div className="w-full h-full flex items-center justify-center">
              <currentExercise.animation className="w-full h-full max-h-48" />
            </div>
          ) : (
            <div className="relative flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700/80 text-[#A3E635] flex items-center justify-center mb-2 shadow-md">
                <Layers className="w-7 h-7" />
              </div>
              <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                {currentExercise?.name}
              </span>
            </div>
          )}

          {/* Target Muscle chip inside animation card */}
          <div className="absolute bottom-3 inset-x-4 flex justify-between items-center text-[10px] text-slate-400 font-medium bg-slate-950/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-800/80">
            <span className="capitalize">{currentExercise?.targetMuscle}</span>
            <span className="text-[#A3E635] font-bold tracking-wider uppercase text-[9px]">Looping Rep</span>
          </div>
        </div>

        {/* Exercise Name & Target Muscle */}
        <div className="mt-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-display leading-tight">
            {currentExercise?.name}
          </h2>
          <span className="text-xs text-slate-400 capitalize mt-0.5 block">
            {currentExercise?.targetMuscle}
          </span>
        </div>

        {/* Reps or Countdown Timer Display */}
        <div className="mt-4">
          {currentExercise?.durationSeconds ? (
            <div className="flex flex-col items-center">
              <span className="text-6xl font-black text-[#A3E635] font-display tabular-nums drop-shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                {secondsLeft}
                <span className="text-2xl font-bold text-slate-400 ml-1">s</span>
              </span>
              <span className="text-[11px] text-slate-400 uppercase font-semibold mt-0.5">
                Countdown Timer
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-5xl font-black text-[#A3E635] font-display tabular-nums">
                {currentExercise?.reps}
                <span className="text-2xl font-bold text-slate-400 ml-1.5">reps</span>
              </span>
              <span className="text-[11px] text-slate-400 uppercase font-semibold mt-0.5">
                Target Repetitions
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons: Previous, Pause/Resume, Skip (and Complete Reps) */}
      <div className="pt-2 space-y-2.5">
        {/* If exercise is rep-based, provide prominent Complete button */}
        {!currentExercise?.durationSeconds && (
          <button
            type="button"
            onClick={handleExerciseDone}
            className="w-full h-13 rounded-2xl bg-[#A3E635] hover:bg-[#b0f242] active:scale-[0.98] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(163,230,53,0.35)] transition-all cursor-pointer font-display"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>Complete Set ({currentExercise?.reps} Reps)</span>
          </button>
        )}

        {/* 3 Main Action Controls: Previous, Pause, Skip */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* 1. Previous Button */}
          <button
            type="button"
            onClick={handlePreviousExercise}
            disabled={isFirstExercise}
            className="h-12 rounded-2xl bg-slate-800/90 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 font-bold text-xs flex items-center justify-center gap-1 border border-slate-700/60 cursor-pointer active:scale-95 transition-all"
            aria-label="Previous Exercise"
          >
            <SkipBack className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* 2. Pause / Resume Button */}
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="h-12 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer active:scale-95 transition-all"
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 text-[#A3E635] fill-[#A3E635]" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 text-slate-300" />
                <span>Pause</span>
              </>
            )}
          </button>

          {/* 3. Skip Button */}
          <button
            type="button"
            onClick={handleSkipExercise}
            className="h-12 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1 border border-slate-700/60 cursor-pointer active:scale-95 transition-all"
            aria-label="Skip Exercise"
          >
            <span>Skip</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
