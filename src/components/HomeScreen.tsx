import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Clock,
  Play,
  Check,
  Moon,
  Lock,
  Calendar,
  TrendingUp,
  Settings,
  Dumbbell,
  User,
  Scale,
  Ruler,
  RotateCcw,
  Save,
  Sparkles,
  Trophy,
  ChevronRight,
  Plus,
  Minus,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Eye,
} from 'lucide-react';
import {
  UserProfile,
  DayWorkout,
  Equipment,
  FocusArea,
  WeightEntry,
  generateWorkoutPlan,
  getCompletedDays,
  getWorkoutCompletions,
  calculateStreak,
  calculateUserFitnessLevel,
  calculateBMI,
  saveUserProfile,
  resetAllData,
  resetWorkoutProgress,
  getWeightLogs,
  addWeightLog,
  getRestTimeSetting,
  saveRestTimeSetting,
  calculateDayEstimatedMinutes,
} from '../dataService';
import { logout } from '../authService';
import { WorkoutPlayer } from './WorkoutPlayer';
import { DayPreviewModal } from './DayPreviewModal';
import { AnimationPreviewModal } from './AnimationPreviewModal';

interface HomeScreenProps {
  profile: UserProfile | null;
  onResetOnboarding: () => void;
  onRefreshProfile: () => void;
  onLogout: () => void;
}

type TabType = 'plan' | 'progress' | 'settings';

const FOCUS_AREA_SETTINGS_OPTIONS: {
  id: FocusArea;
  title: string;
  subtitle: string;
  icon: string;
  splitSummary: string;
}[] = [
  {
    id: 'chest',
    title: 'Chest',
    subtitle: '7-day chest progressive split (Pectoral tension & volume)',
    icon: '🛡️',
    splitSummary: 'Day 1 Chest heavy · Day 2 Back+core · Day 3 Chest volume · Day 4 Rest · Day 5 Chest+shoulders · Day 6 Fat burn · Day 7 Rest',
  },
  {
    id: 'abs',
    title: 'Abs',
    subtitle: 'Core definition, 6-pack matrix & oblique compression',
    icon: '⚡',
    splitSummary: 'Day 1 Upper abs · Day 2 Lower abs · Day 3 Core · Day 4 Rest · Day 5 Obliques · Day 6 Fat burn · Day 7 Rest',
  },
  {
    id: 'full_body',
    title: 'Full body',
    subtitle: 'Total body conditioning, metabolic power & functional burn',
    icon: '🔥',
    splitSummary: 'Day 1 Full body · Day 2 Upper body · Day 3 Lower body · Day 4 Rest · Day 5 Power · Day 6 Fat burn · Day 7 Rest',
  },
];

const ALL_EQUIPMENT_OPTIONS: { id: Equipment; name: string; icon: string }[] = [
  { id: 'none', name: 'None (Bodyweight)', icon: '🏃' },
  { id: 'dumbbell', name: 'Dumbbells', icon: '🏋️' },
  { id: 'pullup_bar', name: 'Pull-up bar', icon: '🧗' },
  { id: 'bench', name: 'Bench', icon: '🛋️' },
  { id: 'band', name: 'Resistance bands', icon: '🎗️' },
  { id: 'kettlebell', name: 'Kettlebell', icon: '⚡' },
  { id: 'jump_rope', name: 'Jump rope', icon: '🪢' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onResetOnboarding,
  onRefreshProfile,
  onLogout,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<TabType>('plan');

  // Workout data & completions
  const [completedDays, setCompletedDays] = useState<number[]>(() => getCompletedDays());
  const [completions, setCompletions] = useState(() => getWorkoutCompletions());

  // Weight logs
  const [weightLogs, setWeightLogs] = useState<WeightEntry[]>(() => getWeightLogs());
  const [newLogWeight, setNewLogWeight] = useState<number>(() => profile?.weight || 72);
  const [isAddingWeight, setIsAddingWeight] = useState<boolean>(false);
  const [weightNotice, setWeightNotice] = useState<string | null>(null);

  // Settings State
  const [editAge, setEditAge] = useState<number>(profile?.age || 26);
  const [editHeight, setEditHeight] = useState<number>(profile?.height || 175);
  const [editWeight, setEditWeight] = useState<number>(profile?.weight || 72);
  const [editEquipment, setEditEquipment] = useState<Equipment[]>(profile?.equipment || ['none']);
  const [editFocusArea, setEditFocusArea] = useState<FocusArea>(profile?.focusArea || 'chest');
  const [restTime, setRestTime] = useState<number>(() => getRestTimeSetting());
  const [savedSettingsNotice, setSavedSettingsNotice] = useState<string | null>(null);
  const [confirmResetType, setConfirmResetType] = useState<'progress' | 'all' | null>(null);
  const [showAnimationPreview, setShowAnimationPreview] = useState<boolean>(false);

  // Keep settings state in sync when profile updates
  useEffect(() => {
    if (profile) {
      setEditAge(profile.age);
      setEditHeight(profile.height);
      setEditWeight(profile.weight);
      setEditEquipment(profile.equipment || ['none']);
      setEditFocusArea(profile.focusArea || 'chest');
    }
  }, [profile]);

  // Active workout player state
  const [activeWorkout, setActiveWorkout] = useState<DayWorkout | null>(null);

  // Selected day detail sheet
  const [selectedDayDetail, setSelectedDayDetail] = useState<DayWorkout | null>(null);

  // Locked day notice toast
  const [lockedToast, setLockedToast] = useState<string | null>(null);

  // Workout Plan: re-generates whenever profile changes
  const workoutPlan = useMemo<DayWorkout[]>(() => generateWorkoutPlan(profile), [profile]);

  // Current active day & streak
  const currentStreak = calculateStreak(completedDays);
  const nextIncompleteDay = workoutPlan.find((d) => !completedDays.includes(d.day))?.day || 1;
  const todayWorkout = workoutPlan.find((d) => d.day === nextIncompleteDay) || workoutPlan[0];

  // Dynamic time greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Fitness level assessment
  const fitnessAssessment = useMemo(() => {
    return calculateUserFitnessLevel(
      profile?.height || 175,
      profile?.weight || 72,
      profile?.age || 26
    );
  }, [profile]);

  // Aggregated metrics
  const totalCaloriesBurned = completions.reduce((acc, c) => acc + (c.caloriesBurned || 0), 0);
  const totalMinutesTrained = completions.reduce((acc, c) => acc + (c.durationMinutes || 0), 0);
  const progressPercent = Math.round((completedDays.length / 30) * 100);

  // Calculate weight change from first entry to latest
  const weightChange = useMemo(() => {
    if (weightLogs.length < 2) return null;
    const start = weightLogs[0].weight;
    const current = weightLogs[weightLogs.length - 1].weight;
    const diff = parseFloat((current - start).toFixed(1));
    return diff;
  }, [weightLogs]);

  // Refresh completion data after workout finishes
  const handleWorkoutFinished = () => {
    const updatedCompleted = getCompletedDays();
    const updatedCompletions = getWorkoutCompletions();
    setCompletedDays(updatedCompleted);
    setCompletions(updatedCompletions);
    setActiveWorkout(null);
    setSelectedDayDetail(null);
    onRefreshProfile();
  };

  // Day tap handler - preview day routine before starting
  const handleDayTap = (dayItem: DayWorkout) => {
    setSelectedDayDetail(dayItem);
  };

  // Handle adding today's weight log
  const handleAddTodayWeight = () => {
    const updated = addWeightLog(newLogWeight);
    setWeightLogs(updated);
    setEditWeight(newLogWeight);
    setIsAddingWeight(false);
    setWeightNotice(`Logged ${newLogWeight} kg successfully!`);
    onRefreshProfile();
    setTimeout(() => setWeightNotice(null), 2500);
  };

  // Equipment toggle in settings
  const toggleSettingsEquipment = (eqId: Equipment) => {
    if (eqId === 'none') {
      setEditEquipment(['none']);
      return;
    }
    const withoutNone = editEquipment.filter((item) => item !== 'none');
    if (withoutNone.includes(eqId)) {
      const remaining = withoutNone.filter((item) => item !== eqId);
      setEditEquipment(remaining.length === 0 ? ['none'] : remaining);
    } else {
      setEditEquipment([...withoutNone, eqId]);
    }
  };

  // Save Settings & Regenerate Plan
  const handleSaveSettingsAndRegenerate = () => {
    if (profile) {
      const updatedProfile: Partial<UserProfile> = {
        age: editAge,
        height: editHeight,
        weight: editWeight,
        equipment: editEquipment,
        focusArea: editFocusArea,
      };
      saveUserProfile(updatedProfile);
      saveRestTimeSetting(restTime);
      onRefreshProfile();
      setSavedSettingsNotice('Plan regenerated with new equipment & focus area!');
      setTimeout(() => setSavedSettingsNotice(null), 3000);
    }
  };

  // Reset progress only (days 1-30 reset)
  const handleConfirmResetProgress = () => {
    resetWorkoutProgress();
    setCompletedDays([]);
    setCompletions([]);
    setConfirmResetType(null);
    setSavedSettingsNotice('30-day progress reset to Day 1.');
    setTimeout(() => setSavedSettingsNotice(null), 2500);
  };

  // Full app reset
  const handleConfirmResetAll = () => {
    resetAllData();
    onResetOnboarding();
  };

  const bmiInfo = calculateBMI(editHeight, editWeight);

  return (
    <div className="flex-1 w-full flex flex-col justify-between bg-[#0F172A] text-white relative overflow-hidden">
      {/* Toast alert for locked days / notices */}
      <AnimatePresence>
        {(lockedToast || weightNotice || savedSettingsNotice) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 inset-x-4 z-50 p-3 rounded-2xl bg-slate-800/95 border border-[#A3E635]/50 text-xs font-semibold text-center text-white shadow-xl backdrop-blur-md"
          >
            {lockedToast || weightNotice || savedSettingsNotice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Scrollable View Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-20">
        {/* ======================================================== */}
        {/* TAB 1: PLAN (HOME & 30-DAY GRID)                          */}
        {/* ======================================================== */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            {/* Top: Greeting, Current Day Number, Progress Bar */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-xs font-semibold text-slate-400">
                    {greeting} · Day {nextIncompleteDay} of 30
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight mt-0.5">
                    Hi, {profile?.name?.trim() || 'Athlete'}
                  </h1>
                </div>

                {/* Streak Chip */}
                <div className="px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1.5 shadow-sm">
                  <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                  <span className="text-xs font-black text-white tabular-nums">
                    {currentStreak} <span className="text-[10px] font-medium text-slate-400">Streak</span>
                  </span>
                </div>
              </div>

              {/* Progress Bar (e.g. Day 4 of 30) */}
              <div className="mt-2.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-300">
                    {completedDays.length} of 30 days completed
                  </span>
                  <span className="text-[#A3E635] font-mono tabular-nums">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#A3E635] rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(163,230,53,0.6)]"
                    style={{ width: `${Math.max(4, progressPercent)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Today's Hero Workout Card */}
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-800/90 via-slate-900 to-[#0B132B] border border-slate-700/60 p-4.5 shadow-xl overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#A3E635]/15 blur-2xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#A3E635]">
                    Today's Workout · Day {todayWorkout.day}
                  </span>
                  {todayWorkout.isRestDay ? (
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-800/60 flex items-center gap-1">
                      <Moon className="w-3 h-3" /> Rest Day
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                      {todayWorkout.targetFocus}
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-black text-white font-display leading-tight mb-1">
                  {todayWorkout.title}
                </h2>
                <p className="text-xs text-slate-300 mb-3 line-clamp-1">{todayWorkout.subtitle}</p>

                {/* Micro stats */}
                <div className="flex items-center gap-3 text-xs text-slate-300 mb-4 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#A3E635]" />
                    <span className="tabular-nums">{todayWorkout.durationMinutes} min</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span className="tabular-nums">{todayWorkout.estimatedCalories} kcal</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5 text-[#A3E635]" />
                    <span>{todayWorkout.exercises.length} moves</span>
                  </span>
                </div>

                {/* Primary CTA: Open Day Preview before starting */}
                <button
                  type="button"
                  onClick={() => setSelectedDayDetail(todayWorkout)}
                  className="w-full h-12 rounded-xl bg-[#A3E635] hover:bg-[#b0f242] active:scale-[0.98] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(163,230,53,0.35)] transition-all cursor-pointer font-display"
                >
                  <Play className="w-4 h-4 fill-slate-950 stroke-none" />
                  <span>
                    {todayWorkout.isRestDay ? 'Preview Recovery Session' : 'Start Today’s Workout'}
                  </span>
                </button>
              </div>
            </div>

            {/* ================= 30-DAY GRID ================= */}
            {/* ================= 30-DAY GRID ================= */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#A3E635]" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">
                    30-Day Program
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Tap day for details
                </span>
              </div>

              {/* Weekly Split Pattern Header */}
              <div className="mb-3 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">
                    Focus: <span className="text-[#A3E635] font-black">{profile?.focusArea === 'abs' ? 'Abs' : profile?.focusArea === 'full_body' ? 'Full Body' : 'Chest'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Weekly Split</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {profile?.focusArea === 'abs'
                    ? 'Day 1 Upper abs · Day 2 Lower abs · Day 3 Core · Day 4 Rest · Day 5 Obliques · Day 6 Fat burn · Day 7 Rest'
                    : profile?.focusArea === 'full_body'
                    ? 'Day 1 Full body · Day 2 Upper body · Day 3 Lower body · Day 4 Rest · Day 5 Power · Day 6 Fat burn · Day 7 Rest'
                    : 'Day 1 Chest heavy · Day 2 Back + core · Day 3 Chest volume · Day 4 Rest · Day 5 Chest + shoulders · Day 6 Fat burn · Day 7 Rest'}
                </p>
              </div>

              {/* 5 columns x 6 rows grid */}
              <div className="grid grid-cols-5 gap-2.5">
                {workoutPlan.map((dayItem) => {
                  const isCompleted = completedDays.includes(dayItem.day);
                  const isToday = dayItem.day === nextIncompleteDay;
                  const isFutureLocked = dayItem.day > nextIncompleteDay && !isCompleted;
                  const isRest = dayItem.isRestDay;
                  const estTime = calculateDayEstimatedMinutes(dayItem.exercises);

                  return (
                    <div
                      key={dayItem.day}
                      onClick={() => handleDayTap(dayItem)}
                      title={`Day ${dayItem.day} · ${dayItem.shortFocus || 'Chest'}`}
                      className={`relative min-h-[74px] rounded-2xl p-1.5 flex flex-col items-center justify-between transition-all cursor-pointer select-none ${
                        isCompleted
                          ? 'bg-[#A3E635]/15 border border-[#A3E635]/40 text-white hover:bg-[#A3E635]/20'
                          : isToday
                          ? 'bg-slate-800/90 border-2 border-[#A3E635] shadow-[0_0_18px_rgba(163,230,53,0.4)] animate-pulse-subtle'
                          : isRest
                          ? 'bg-slate-900/90 border border-indigo-900/50 hover:border-indigo-700/60'
                          : isFutureLocked
                          ? 'bg-slate-900/40 border border-slate-800/60 opacity-60 hover:opacity-85'
                          : 'bg-slate-900 border border-slate-800'
                      }`}
                    >
                      {/* Day Number Label & Mini Status Indicator */}
                      <div className="w-full flex items-center justify-between px-0.5">
                        <span
                          className={`text-[11px] font-black font-mono leading-none ${
                            isToday
                              ? 'text-[#A3E635]'
                              : isCompleted
                              ? 'text-[#A3E635]'
                              : 'text-slate-400'
                          }`}
                        >
                          D{dayItem.day}
                        </span>
                        {isCompleted ? (
                          <Check className="w-2.5 h-2.5 text-[#A3E635] stroke-[3]" />
                        ) : isToday ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] animate-ping" />
                        ) : isRest ? (
                          <Moon className="w-2.5 h-2.5 text-indigo-400" />
                        ) : isFutureLocked ? (
                          <Lock className="w-2.5 h-2.5 text-slate-500" />
                        ) : null}
                      </div>

                      {/* Day Focus Label (e.g. Day 3 · Chest) */}
                      <div className="w-full flex items-center justify-center my-0.5 px-0.5">
                        <span
                          className={`text-[9.5px] font-black uppercase tracking-tight text-center truncate w-full leading-tight ${
                            isToday
                              ? 'text-[#A3E635]'
                              : isCompleted
                              ? 'text-[#A3E635]'
                              : isRest
                              ? 'text-indigo-300'
                              : 'text-slate-200'
                          }`}
                        >
                          {dayItem.shortFocus}
                        </span>
                      </div>

                      {/* Bottom estimated time */}
                      <span
                        className={`text-[10px] font-bold font-mono tracking-tight leading-none ${
                          isToday
                            ? 'text-[#A3E635]'
                            : isCompleted
                            ? 'text-[#A3E635]/90'
                            : 'text-slate-400'
                        }`}
                      >
                        {estTime} min
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Grid Legend */}
              <div className="mt-3.5 flex items-center justify-around text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#A3E635]" />
                  <span>Finished</span>
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full border border-[#A3E635] bg-[#A3E635]/30 animate-pulse" />
                  <span>Today</span>
                </span>
                <span className="flex items-center gap-1">
                  <Moon className="w-3 h-3 text-indigo-400" />
                  <span>Rest</span>
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Locked</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PROGRESS (DAYS, STREAK, WEIGHT LOG & CHART)       */}
        {/* ======================================================== */}
        {activeTab === 'progress' && (
          <div className="space-y-4 pt-1">
            <div>
              <span className="text-xs font-semibold text-[#A3E635] uppercase tracking-wider">
                Transformation Analytics
              </span>
              <h2 className="text-2xl font-black text-white font-display">
                Your Progress
              </h2>
            </div>

            {/* Streak & Completion Top Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Card 1: Days Completed */}
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Days Done</span>
                  <Trophy className="w-4 h-4 text-[#A3E635]" />
                </div>
                <div className="my-2">
                  <div className="text-3xl font-black text-white font-display tabular-nums">
                    {completedDays.length}
                    <span className="text-sm font-normal text-slate-500"> / 30</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-[#A3E635]"
                      style={{ width: `${Math.max(5, progressPercent)}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {progressPercent}% Complete
                </span>
              </div>

              {/* Card 2: Current Streak */}
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Streak</span>
                  <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                </div>
                <div className="my-2">
                  <div className="text-3xl font-black text-white font-display tabular-nums flex items-baseline gap-1">
                    <span>{currentStreak}</span>
                    <span className="text-sm font-semibold text-orange-400">Days</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {currentStreak > 0 ? 'Consistency unlocked!' : 'Start Day 1 today!'}
                  </p>
                </div>
                <span className="text-[10px] text-[#A3E635] font-semibold">
                  Personal Best: {Math.max(currentStreak, completedDays.length)}d
                </span>
              </div>
            </div>

            {/* Aggregate Stats Strip */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-center">
                <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                <span className="text-xl font-black text-[#A3E635] font-display tabular-nums">
                  {totalCaloriesBurned}
                </span>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Calories</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-center">
                <Clock className="w-4 h-4 text-[#A3E635] mx-auto mb-1" />
                <span className="text-xl font-black text-white font-display tabular-nums">
                  {totalMinutesTrained}m
                </span>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Minutes Logged</p>
              </div>
            </div>

            {/* ================= WEIGHT LOG & CHART ================= */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#A3E635]" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">
                      Weight Tracker
                    </h3>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-white font-display tabular-nums">
                      {weightLogs[weightLogs.length - 1]?.weight || editWeight} kg
                    </span>
                    {weightChange !== null && (
                      <span
                        className={`text-xs font-bold flex items-center ${
                          weightChange <= 0 ? 'text-[#A3E635]' : 'text-orange-400'
                        }`}
                      >
                        {weightChange <= 0 ? (
                          <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" />
                        ) : (
                          <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" />
                        )}
                        {weightChange > 0 ? `+${weightChange}` : weightChange} kg
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingWeight(!isAddingWeight)}
                  className="px-3 py-1.5 rounded-xl bg-[#A3E635] hover:bg-[#b0f242] text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Log Weight</span>
                </button>
              </div>

              {/* Log Input Drawer / Stepper */}
              <AnimatePresence>
                {isAddingWeight && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Today's Weight:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setNewLogWeight((w) => parseFloat((w - 0.2).toFixed(1)))}
                          className="w-8 h-8 rounded-lg bg-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-600 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-16 text-center text-base font-bold text-white font-mono">
                          {newLogWeight} kg
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewLogWeight((w) => parseFloat((w + 0.2).toFixed(1)))}
                          className="w-8 h-8 rounded-lg bg-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-600 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddTodayWeight}
                      className="w-full h-10 rounded-xl bg-[#A3E635] hover:bg-[#b0f242] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Save Today's Weight</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SVG Weight Trend Chart */}
              <div className="pt-2">
                {weightLogs.length >= 1 ? (
                  <div className="relative w-full h-36 bg-slate-950/60 rounded-2xl border border-slate-800/80 p-2 overflow-hidden flex flex-col justify-between">
                    {/* SVG Curve */}
                    {(() => {
                      const weights = weightLogs.map((l) => l.weight);
                      const minW = Math.min(...weights) - 1;
                      const maxW = Math.max(...weights) + 1;
                      const range = maxW - minW || 1;
                      const width = 320;
                      const height = 90;

                      // Map points
                      const points = weightLogs.map((entry, idx) => {
                        const x =
                          weightLogs.length === 1
                            ? width / 2
                            : (idx / (weightLogs.length - 1)) * (width - 24) + 12;
                        const y = height - ((entry.weight - minW) / range) * (height - 20) - 10;
                        return { x, y, weight: entry.weight, date: entry.date };
                      });

                      const pathD = points.reduce((acc, p, idx) => {
                        return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
                      }, '');

                      return (
                        <div className="relative w-full h-full flex flex-col justify-between">
                          <svg className="w-full h-24 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
                            <defs>
                              <linearGradient id="limeGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#A3E635" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#A3E635" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>

                            {/* Guideline */}
                            <line
                              x1="0"
                              y1={height / 2}
                              x2={width}
                              y2={height / 2}
                              stroke="#334155"
                              strokeDasharray="4 4"
                              strokeWidth="1"
                            />

                            {/* Filled curve */}
                            {points.length > 1 && (
                              <path
                                d={`${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`}
                                fill="url(#limeGrad)"
                              />
                            )}

                            {/* Stroke line */}
                            <path
                              d={pathD}
                              fill="none"
                              stroke="#A3E635"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            {/* Data points */}
                            {points.map((p, idx) => (
                              <g key={idx}>
                                <circle
                                  cx={p.x}
                                  cy={p.y}
                                  r="4"
                                  className="fill-[#A3E635] stroke-slate-900 stroke-2"
                                />
                                <text
                                  x={p.x}
                                  y={p.y - 8}
                                  textAnchor="middle"
                                  className="fill-white text-[9px] font-mono font-bold"
                                >
                                  {p.weight}
                                </text>
                              </g>
                            ))}
                          </svg>

                          {/* Date Axis */}
                          <div className="flex justify-between text-[9px] text-slate-500 font-mono px-2 pt-1 border-t border-slate-800/80">
                            <span>{weightLogs[0]?.date.slice(5) || 'Start'}</span>
                            <span>{weightLogs.length} Entries Logged</span>
                            <span>{weightLogs[weightLogs.length - 1]?.date.slice(5) || 'Today'}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No weight records logged yet. Tap "Log Weight" above to start your trend chart.
                  </div>
                )}
              </div>
            </div>

            {/* Session History Log */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Workout History ({completions.length} Finished)
              </span>
              {completions.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  No completed sessions yet. Start Day 1 to populate your workout logs!
                </p>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto no-scrollbar">
                  {[...completions].reverse().map((c) => (
                    <div
                      key={c.day}
                      className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#A3E635] text-slate-950 font-black text-[10px] flex items-center justify-center">
                          D{c.day}
                        </div>
                        <span className="font-bold text-white">Day {c.day} Session</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <span>{c.durationMinutes} min</span>
                        <span className="text-[#A3E635] font-semibold">{c.caloriesBurned} kcal</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: SETTINGS (EDIT PROFILE, EQUIPMENT, REST, RESETS)  */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-4 pt-1">
            <div>
              <span className="text-xs font-semibold text-[#A3E635] uppercase tracking-wider">
                Preferences & Customization
              </span>
              <h2 className="text-2xl font-black text-white font-display">
                Settings
              </h2>
            </div>

            {/* Section 1: Edit Body Metrics (Age, Height, Weight) */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3.5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase">
                  Edit Body Metrics
                </span>
                <span className="text-[11px] font-bold text-[#A3E635]">
                  BMI: {bmiInfo.bmi} ({bmiInfo.category})
                </span>
              </div>

              {/* Age */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Age (years)</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditAge((a) => Math.max(13, a - 1))}
                    className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-white tabular-nums">
                    {editAge}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditAge((a) => Math.min(80, a + 1))}
                    className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Height */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Height (cm)</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditHeight((h) => Math.max(120, h - 1))}
                    className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-white tabular-nums">
                    {editHeight}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditHeight((h) => Math.min(220, h + 1))}
                    className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Weight */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Weight (kg)</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditWeight((w) => Math.max(30, parseFloat((w - 0.5).toFixed(1))))}
                    className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-white tabular-nums">
                    {editWeight}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditWeight((w) => Math.min(200, parseFloat((w + 0.5).toFixed(1))))}
                    className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Focus Area Selection (Chest, Abs, Full body) */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase">
                  Program Focus Area
                </span>
                <span className="text-[11px] font-bold text-[#A3E635] capitalize">
                  {editFocusArea.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2">
                {FOCUS_AREA_SETTINGS_OPTIONS.map((opt) => {
                  const isSelected = editFocusArea === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setEditFocusArea(opt.id)}
                      className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#A3E635]/15 border-[#A3E635] text-white shadow-sm'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl shrink-0">{opt.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white font-display">{opt.title}</span>
                            {opt.id === 'chest' && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[#A3E635]/20 text-[#A3E635] rounded-full border border-[#A3E635]/30">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{opt.subtitle}</p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                          isSelected
                            ? 'bg-[#A3E635] border-[#A3E635] text-slate-950'
                            : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Edit Equipment (Multi-select) */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase">
                  Available Equipment
                </span>
                <span className="text-[11px] text-slate-400">
                  {editEquipment.includes('none') ? 'Bodyweight only' : `${editEquipment.length} selected`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {ALL_EQUIPMENT_OPTIONS.map((item) => {
                  const isSelected = editEquipment.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSettingsEquipment(item.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#A3E635]/15 border-[#A3E635] text-white shadow-sm'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{item.icon}</span>
                        <span className="truncate">{item.name}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#A3E635] border-[#A3E635] text-slate-950'
                            : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Rest Time Setting */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase">
                  Rest Duration Between Moves
                </span>
                <span className="text-xs font-black text-[#A3E635] tabular-nums">
                  {restTime} Seconds
                </span>
              </div>

              {/* Quick Preset Pills */}
              <div className="grid grid-cols-4 gap-2">
                {[15, 20, 30, 45].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setRestTime(sec)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      restTime === sec
                        ? 'bg-[#A3E635] text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Save & Regenerate Plan CTA */}
            <div>
              <button
                type="button"
                onClick={handleSaveSettingsAndRegenerate}
                className="w-full h-13 rounded-2xl bg-[#A3E635] hover:bg-[#b0f242] active:scale-[0.98] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(163,230,53,0.35)] transition-all cursor-pointer font-display"
              >
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>Save & Regenerate 30-Day Plan</span>
              </button>
            </div>

            {/* Test Page: Animation Preview */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 uppercase">
                    Animation Preview
                  </span>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[#A3E635]/20 text-[#A3E635] rounded-full border border-[#A3E635]/30">
                    Test Page
                  </span>
                </div>
                <span className="text-[11px] text-[#A3E635] font-mono font-bold">52 Moves</span>
              </div>
              <p className="text-xs text-slate-400 leading-snug">
                Review all exercises animating smoothly with the reusable rigged stick figure, kinematic joints, floor line, and dumbbells.
              </p>
              <button
                type="button"
                onClick={() => setShowAnimationPreview(true)}
                className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-all"
              >
                <Eye className="w-4 h-4 text-[#A3E635]" />
                <span>Open Animation Preview Grid</span>
              </button>
            </div>

            {/* Section 4: Reset Options */}
            <div className="pt-2 space-y-2.5">
              {/* Option 1: Reset Workout Progress */}
              {confirmResetType !== 'progress' ? (
                <button
                  type="button"
                  onClick={() => setConfirmResetType('progress')}
                  className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-amber-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Workout Progress (Back to Day 1)</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 space-y-2">
                  <p className="text-xs text-amber-200 text-center font-medium">
                    Reset completed days back to Day 1? (Keeps profile intact)
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmResetType(null)}
                      className="flex-1 h-9 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmResetProgress}
                      className="flex-1 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                    >
                      Confirm Reset
                    </button>
                  </div>
                </div>
              )}

              {/* Option 2: Full App & Onboarding Reset */}
              {confirmResetType !== 'all' ? (
                <button
                  type="button"
                  onClick={() => setConfirmResetType('all')}
                  className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-rose-400 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart App & Retake Onboarding</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-2">
                  <p className="text-xs text-rose-200 text-center font-medium">
                    Wipe all local data and return to welcome onboarding flow?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmResetType(null)}
                      className="flex-1 h-9 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmResetAll}
                      className="flex-1 h-9 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                    >
                      Confirm Full Wipe
                    </button>
                  </div>
                </div>
              )}

              {/* Option 3: Log Out */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onLogout();
                  }}
                  className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-rose-400 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out ({profile?.email || 'Current Account'})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* FIXED BOTTOM TAB BAR (PLAN, PROGRESS, SETTINGS)          */}
      {/* ======================================================== */}
      <div className="shrink-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-3 items-center px-4 py-2 z-30">
        {/* Tab 1: Plan */}
        <button
          type="button"
          onClick={() => setActiveTab('plan')}
          className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'plan' ? 'text-[#A3E635]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5 mb-1 stroke-[2.2]" />
          <span className="text-[11px] font-bold font-display tracking-tight">Plan</span>
        </button>

        {/* Tab 2: Progress */}
        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'progress' ? 'text-[#A3E635]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-1 stroke-[2.2]" />
          <span className="text-[11px] font-bold font-display tracking-tight">Progress</span>
        </button>

        {/* Tab 3: Settings */}
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'settings' ? 'text-[#A3E635]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5 mb-1 stroke-[2.2]" />
          <span className="text-[11px] font-bold font-display tracking-tight">Settings</span>
        </button>
      </div>

      {/* ================= DAY PREVIEW SCREEN / MODAL ================= */}
      <DayPreviewModal
        workout={selectedDayDetail}
        onClose={() => setSelectedDayDetail(null)}
        onStartWorkout={(chosen) => {
          setSelectedDayDetail(null);
          setActiveWorkout(chosen);
        }}
      />

      {/* ================= WORKOUT PLAYER ================= */}
      {activeWorkout && (
        <WorkoutPlayer
          workout={activeWorkout}
          onClose={() => setActiveWorkout(null)}
          onFinishWorkout={handleWorkoutFinished}
        />
      )}

      {/* ================= ANIMATION PREVIEW TEST PAGE ================= */}
      {showAnimationPreview && (
        <AnimationPreviewModal onClose={() => setShowAnimationPreview(false)} />
      )}
    </div>
  );
};
