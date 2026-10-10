/**
 * dataService.ts
 * Single source of truth for all data persistence and retrieval in HomeFit 30.
 * Currently backed by localStorage; designed for seamless replacement with Supabase.
 */

export type Gender = 'male' | 'female';

export type Goal = 'lose_belly_fat' | 'build_abs' | 'get_stronger';

export type FocusArea = 'chest' | 'abs' | 'full_body';

export type Equipment =
  | 'none'
  | 'dumbbell'
  | 'pullup_bar'
  | 'bench'
  | 'band'
  | 'kettlebell'
  | 'jump_rope';

export interface UserProfile {
  name?: string;
  email?: string;
  gender: Gender;
  age: number;
  height: number; // cm
  weight: number; // kg
  goal: Goal;
  focusArea?: FocusArea;
  equipment: Equipment[];
  createdAt: string;
  onboardingCompleted: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  durationSeconds?: number;
  seconds?: number;
  reps?: number;
  sets?: number;
  equipmentRequired: Equipment;
  targetMuscle: string;
  targetArea?: string;
  difficulty?: string;
  instructions: string[];
  animationType: string;
  restAfterSeconds: number;
  animation?: React.ComponentType<{ className?: string }>;
}

export interface DayWorkout {
  day: number;
  title: string;
  subtitle: string;
  targetFocus: string;
  focusLabel: string;
  shortFocus: string;
  durationMinutes: number;
  estimatedCalories: number;
  isRestDay: boolean;
  difficultyLevel?: string;
  weekNumber?: number;
  exercises: Exercise[];
}

export interface WorkoutCompletion {
  day: number;
  completedAt: string;
  durationMinutes: number;
  caloriesBurned: number;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
}

const STORAGE_KEYS = {
  PROFILE: 'homefit30_user_profile',
  COMPLETED_DAYS: 'homefit30_completed_days',
  COMPLETIONS: 'homefit30_completions',
  ONBOARDING_STATUS: 'homefit30_onboarding_done',
  WEIGHT_LOGS: 'homefit30_weight_logs',
  REST_TIME: 'homefit30_rest_time',
};

export function normalizeEquipmentId(raw: string): Equipment | null {
  if (!raw) return null;
  const s = raw.toLowerCase().trim();
  if (s === 'none' || s === 'bodyweight' || s === 'no_equipment') return 'none';
  if (s === 'dumbbell' || s === 'dumbbells') return 'dumbbell';
  if (s === 'pullup_bar' || s === 'pull_up_bar' || s === 'pullup' || s === 'pull-up-bar') return 'pullup_bar';
  if (s === 'bench' || s === 'workout_bench') return 'bench';
  if (s === 'band' || s === 'bands' || s === 'resistance_band' || s === 'resistance_bands') return 'band';
  if (s === 'kettlebell' || s === 'kettlebells') return 'kettlebell';
  if (s === 'jump_rope' || s === 'jumprope' || s === 'jump-rope') return 'jump_rope';
  return null;
}

export function sanitizeEquipmentList(list: (string | Equipment)[]): Equipment[] {
  if (!list || list.length === 0) return ['none'];
  const sanitized = list
    .map((item) => normalizeEquipmentId(String(item)))
    .filter((item): item is Equipment => item !== null);

  if (sanitized.length === 0) return ['none'];
  if (sanitized.includes('none') && sanitized.length > 1) {
    return sanitized.filter((e) => e !== 'none');
  }
  return Array.from(new Set(sanitized));
}

// Auto-migrate stored profile immediately
export function autoMigrateUserProfile(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    let changed = false;

    const cleanEquipment = sanitizeEquipmentList(parsed.equipment || ['none']);
    if (JSON.stringify(cleanEquipment) !== JSON.stringify(parsed.equipment)) {
      parsed.equipment = cleanEquipment;
      changed = true;
    }

    if (!parsed.focusArea || !['chest', 'abs', 'full_body'].includes(parsed.focusArea)) {
      parsed.focusArea = 'chest';
      changed = true;
    }

    if (changed || localStorage.getItem('homefit30_migrated_v4') !== 'true') {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed));
      localStorage.setItem('homefit30_migrated_v4', 'true');
    }
  } catch (err) {
    console.error('Migration error in autoMigrateUserProfile:', err);
  }
}

// Run migration
autoMigrateUserProfile();

// ==========================================
// USER PROFILE APIS
// ==========================================

export function getUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;

    let migrated = false;
    const cleanEquipment = sanitizeEquipmentList(parsed.equipment || ['none']);
    if (JSON.stringify(cleanEquipment) !== JSON.stringify(parsed.equipment)) {
      parsed.equipment = cleanEquipment;
      migrated = true;
    }

    if (!parsed.focusArea || !['chest', 'abs', 'full_body'].includes(parsed.focusArea)) {
      parsed.focusArea = 'chest';
      migrated = true;
    }

    if (migrated) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed));
    }

    return parsed;
  } catch (err) {
    console.error('Failed to read user profile from storage', err);
    return null;
  }
}

export function saveUserProfile(profileData: Partial<UserProfile>): UserProfile {
  try {
    const existing = getUserProfile() || {
      gender: 'male' as Gender,
      age: 26,
      height: 175,
      weight: 72,
      goal: 'lose_belly_fat' as Goal,
      focusArea: 'chest' as FocusArea,
      equipment: ['none'] as Equipment[],
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    };

    const updated: UserProfile = {
      ...existing,
      ...profileData,
      focusArea: profileData.focusArea || existing.focusArea || 'chest',
    };

    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save user profile to storage', err);
    throw err;
  }
}

export function isOnboardingCompleted(): boolean {
  try {
    const flag = localStorage.getItem(STORAGE_KEYS.ONBOARDING_STATUS);
    if (flag === 'true') return true;

    const profile = getUserProfile();
    return !!profile && profile.onboardingCompleted === true;
  } catch {
    return false;
  }
}

export function setOnboardingCompleted(status: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATUS, status ? 'true' : 'false');
    const profile = getUserProfile();
    if (profile) {
      saveUserProfile({ ...profile, onboardingCompleted: status });
    }
  } catch (err) {
    console.error('Failed to set onboarding status', err);
  }
}

// ==========================================
// WORKOUT PROGRESS & COMPLETION APIS
// ==========================================

export function getCompletedDays(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_DAYS);
    if (!raw) return [];
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

export function getWorkoutCompletions(): WorkoutCompletion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    if (!raw) return [];
    return JSON.parse(raw) as WorkoutCompletion[];
  } catch {
    return [];
  }
}

export function markDayCompleted(
  day: number,
  stats: { durationMinutes: number; caloriesBurned: number }
): { completedDays: number[]; completions: WorkoutCompletion[]; currentStreak: number } {
  try {
    const completedDays = getCompletedDays();
    if (!completedDays.includes(day)) {
      completedDays.push(day);
      completedDays.sort((a, b) => a - b);
      localStorage.setItem(STORAGE_KEYS.COMPLETED_DAYS, JSON.stringify(completedDays));
    }

    const completions = getWorkoutCompletions();
    const existingIndex = completions.findIndex((c) => c.day === day);
    const newRecord: WorkoutCompletion = {
      day,
      completedAt: new Date().toISOString(),
      durationMinutes: stats.durationMinutes,
      caloriesBurned: stats.caloriesBurned,
    };

    if (existingIndex >= 0) {
      completions[existingIndex] = newRecord;
    } else {
      completions.push(newRecord);
    }
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));

    const streak = calculateStreak(completedDays);
    return { completedDays, completions, currentStreak: streak };
  } catch (err) {
    console.error('Failed to mark day as completed', err);
    return { completedDays: getCompletedDays(), completions: getWorkoutCompletions(), currentStreak: 1 };
  }
}

export function calculateStreak(completedDays: number[]): number {
  if (completedDays.length === 0) return 0;
  let streak = 0;
  const sorted = [...new Set(completedDays)].sort((a, b) => a - b);
  const maxDay = sorted[sorted.length - 1];

  for (let d = maxDay; d >= 1; d--) {
    if (sorted.includes(d)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function calculateBMI(heightCm: number, weightKg: number): { bmi: number; category: string } {
  if (!heightCm || !weightKg) return { bmi: 22, category: 'Normal' };
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  let category = 'Normal';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'High BMI';
  return { bmi, category };
}

// ==========================================
// WEIGHT LOG APIS
// ==========================================

export function getWeightLogs(): WeightEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
    if (raw) return JSON.parse(raw);
    const profile = getUserProfile();
    if (profile?.weight) {
      const initial: WeightEntry = {
        id: 'init-1',
        date: new Date().toISOString().split('T')[0],
        weight: profile.weight,
      };
      localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify([initial]));
      return [initial];
    }
    return [];
  } catch {
    return [];
  }
}

export function addWeightLog(weight: number, dateStr?: string): WeightEntry[] {
  try {
    const currentLogs = getWeightLogs();
    const date = dateStr || new Date().toISOString().split('T')[0];
    const existingIndex = currentLogs.findIndex((l) => l.date === date);
    const newEntry: WeightEntry = {
      id: `weight-${Date.now()}`,
      date,
      weight: parseFloat(weight.toFixed(1)),
    };
    if (existingIndex >= 0) {
      currentLogs[existingIndex] = newEntry;
    } else {
      currentLogs.push(newEntry);
      currentLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(currentLogs));

    // Keep profile current weight in sync
    const profile = getUserProfile();
    if (profile) {
      saveUserProfile({ ...profile, weight: newEntry.weight });
    }

    return currentLogs;
  } catch (err) {
    console.error('Failed to add weight log', err);
    return getWeightLogs();
  }
}

// ==========================================
// REST TIME SETTING APIS
// ==========================================

export function getRestTimeSetting(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REST_TIME);
    if (!raw) return 20;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? 20 : parsed;
  } catch {
    return 20;
  }
}

export function saveRestTimeSetting(seconds: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REST_TIME, seconds.toString());
  } catch (err) {
    console.error('Failed to save rest time setting', err);
  }
}

// ==========================================
// RESET APIS
// ==========================================

export function resetWorkoutProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.COMPLETED_DAYS);
    localStorage.removeItem(STORAGE_KEYS.COMPLETIONS);
  } catch (err) {
    console.error('Failed to reset workout progress', err);
  }
}

export function resetAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.COMPLETED_DAYS);
    localStorage.removeItem(STORAGE_KEYS.COMPLETIONS);
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_STATUS);
    localStorage.removeItem(STORAGE_KEYS.WEIGHT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.REST_TIME);
  } catch (err) {
    console.error('Failed to reset app data', err);
  }
}

// ==========================================
// PLAN GENERATION INTEGRATION
// ==========================================

import {
  generate30DayWorkoutPlan,
  calculateUserFitnessLevel,
  EXERCISE_CATALOG,
  PlanExercise,
  DayWorkoutPlan,
  TargetArea,
  Difficulty,
  UserLevel,
  calculateExerciseEstimatedSeconds,
  formatExerciseEstimatedTime,
  calculateDayEstimatedMinutes,
} from './planGenerator';

export type { TargetArea, Difficulty, UserLevel, PlanExercise, DayWorkoutPlan };
export {
  calculateUserFitnessLevel,
  EXERCISE_CATALOG,
  generate30DayWorkoutPlan,
  calculateExerciseEstimatedSeconds,
  formatExerciseEstimatedTime,
  calculateDayEstimatedMinutes,
};

/**
 * Generate 30 distinct daily routines calibrated to user goals, BMI, age, and equipment.
 * Utilizes planGenerator.ts rules:
 * - Every 4th day is a rest day
 * - BMI > 27 or Age > 45 -> Beginner, else Intermediate
 * - Only equipment matching user choices
 * - 6-10 exercises per active day with weekly progressive overload
 */
export function generateWorkoutPlan(profile: UserProfile | null): DayWorkout[] {
  const plan = generate30DayWorkoutPlan({
    heightCm: profile?.height || 175,
    weightKg: profile?.weight || 72,
    age: profile?.age || 26,
    equipment: profile?.equipment || ['none'],
    goal: profile?.goal || 'lose_belly_fat',
    focusArea: profile?.focusArea || 'chest',
  });

  return plan.map((p) => ({
    day: p.day,
    title: p.title,
    subtitle: p.subtitle,
    targetFocus: p.targetFocus,
    focusLabel: p.focusLabel || p.targetFocus,
    shortFocus: p.shortFocus || 'Chest',
    durationMinutes: p.durationMinutes,
    estimatedCalories: p.estimatedCalories,
    isRestDay: p.isRestDay,
    difficultyLevel: p.difficultyLevel,
    weekNumber: p.weekNumber,
    exercises: p.exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      targetMuscle: `${ex.targetArea} (${ex.difficulty})`,
      targetArea: ex.targetArea,
      difficulty: ex.difficulty,
      durationSeconds: ex.seconds,
      seconds: ex.seconds,
      reps: ex.reps,
      sets: ex.sets || 1,
      equipmentRequired: ex.equipment,
      instructions: ex.instructions,
      animationType: ex.animationType,
      restAfterSeconds: ex.restAfterSeconds,
      animation: ex.animation,
    })),
  }));
}
