/**
 * dataService.ts
 * Single source of truth for all data persistence and retrieval in HomeFit 30,
 * backed by Supabase tables: profiles, workout_logs, weight_logs.
 */

import { supabase } from './lib/supabase';

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
  id?: string;
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
  restSeconds?: number;
  onboardingCompleted?: boolean;
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

export function getErrorMessage(err: unknown): string {
  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    return 'No internet, try again';
  }
  const msg = (err as any)?.message || String(err || '');
  if (
    msg.toLowerCase().includes('fetch') ||
    msg.toLowerCase().includes('network') ||
    msg.toLowerCase().includes('failed to fetch')
  ) {
    return 'No internet, try again';
  }
  return msg || 'No internet, try again';
}

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

async function getActiveUserId(providedId?: string): Promise<string | null> {
  if (providedId) return providedId;
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
}

// ==========================================
// USER PROFILE APIS
// ==========================================

export async function getUserProfile(targetUserId?: string): Promise<UserProfile | null> {
  try {
    const userId = await getActiveUserId(targetUserId);
    if (!userId) return null;

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile from Supabase:', error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name || 'Athlete',
      email: user?.email || undefined,
      gender: (data.gender as Gender) || 'male',
      age: Number(data.age) || 26,
      height: Number(data.height_cm) || 175,
      weight: Number(data.weight_kg) || 72,
      goal: (data.goal as Goal) || 'lose_belly_fat',
      focusArea: (data.focus_area as FocusArea) || 'chest',
      equipment: sanitizeEquipmentList(data.equipment || ['none']),
      createdAt: data.plan_start_date || new Date().toISOString(),
      restSeconds: Number(data.rest_seconds) || 20,
      onboardingCompleted: true,
    };
  } catch (err) {
    console.error('Failed to get user profile', err);
    throw err;
  }
}

export async function saveUserProfile(
  profileData: Partial<UserProfile>,
  targetUserId?: string
): Promise<UserProfile> {
  try {
    const userId = await getActiveUserId(targetUserId);
    if (!userId) throw new Error('User not authenticated');

    const existing = await getUserProfile(userId).catch(() => null);

    const name = profileData.name ?? existing?.name ?? 'Athlete';
    const gender = profileData.gender ?? existing?.gender ?? 'male';
    const age = profileData.age ?? existing?.age ?? 26;
    const height_cm = profileData.height ?? existing?.height ?? 175;
    const weight_kg = profileData.weight ?? existing?.weight ?? 72;
    const goal = profileData.goal ?? existing?.goal ?? 'lose_belly_fat';
    const focus_area = profileData.focusArea ?? existing?.focusArea ?? 'chest';
    const equipment = profileData.equipment ? sanitizeEquipmentList(profileData.equipment) : (existing?.equipment || ['none']);
    const rest_seconds = profileData.restSeconds ?? existing?.restSeconds ?? 20;
    const plan_start_date = profileData.createdAt ?? existing?.createdAt ?? new Date().toISOString();

    const payload = {
      id: userId,
      name,
      gender,
      age,
      height_cm,
      weight_kg,
      goal,
      focus_area,
      equipment,
      rest_seconds,
      plan_start_date,
    };

    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('Error saving profile to Supabase:', error);
      throw error;
    }

    // Automatically record weight log entry if weight was provided
    if (profileData.weight !== undefined) {
      const today = new Date().toISOString().split('T')[0];
      try {
        await supabase.from('weight_logs').upsert({
          user_id: userId,
          weight_kg: profileData.weight,
          logged_on: today,
        }, { onConflict: 'user_id,logged_on' });
      } catch (err: unknown) {
        console.warn('Weight log sync warning:', err);
      }
    }

    const { data: { user } } = await supabase.auth.getUser();

    return {
      id: userId,
      name,
      email: user?.email || undefined,
      gender: gender as Gender,
      age,
      height: height_cm,
      weight: weight_kg,
      goal: goal as Goal,
      focusArea: focus_area as FocusArea,
      equipment,
      createdAt: plan_start_date,
      restSeconds: rest_seconds,
      onboardingCompleted: true,
    };
  } catch (err) {
    console.error('Failed to save user profile', err);
    throw err;
  }
}

export async function isOnboardingCompleted(targetUserId?: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(targetUserId);
    return profile !== null;
  } catch {
    return false;
  }
}

export async function setOnboardingCompleted(status: boolean): Promise<void> {
  // Profile existence determines onboarding completion status in Supabase
}

// ==========================================
// WORKOUT PROGRESS & COMPLETION APIS
// ==========================================

export async function getCompletedDays(targetUserId?: string): Promise<number[]> {
  try {
    const userId = await getActiveUserId(targetUserId);
    if (!userId) return [];

    const { data, error } = await supabase
      .from('workout_logs')
      .select('day_number')
      .eq('user_id', userId)
      .order('day_number', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    const days = data.map((r) => Number(r.day_number)).filter(Boolean);
    return Array.from(new Set(days)).sort((a, b) => a - b);
  } catch (err) {
    console.error('Failed to fetch completed days:', err);
    throw err;
  }
}

export async function getWorkoutCompletions(targetUserId?: string): Promise<WorkoutCompletion[]> {
  try {
    const userId = await getActiveUserId(targetUserId);
    if (!userId) return [];

    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('day_number', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data.map((r) => ({
      day: Number(r.day_number),
      completedAt: r.completed_at || new Date().toISOString(),
      durationMinutes: Math.max(1, Math.round((Number(r.duration_seconds) || 0) / 60)),
      caloriesBurned: Number(r.calories) || 0,
    }));
  } catch (err) {
    console.error('Failed to fetch workout completions:', err);
    throw err;
  }
}

export async function markDayCompleted(
  day: number,
  stats: { durationMinutes: number; caloriesBurned: number },
  targetUserId?: string
): Promise<{ completedDays: number[]; completions: WorkoutCompletion[]; currentStreak: number }> {
  try {
    const userId = await getActiveUserId(targetUserId);
    if (!userId) throw new Error('User not authenticated');

    const duration_seconds = Math.round((stats.durationMinutes || 1) * 60);

    const { error } = await supabase.from('workout_logs').upsert(
      {
        user_id: userId,
        day_number: day,
        duration_seconds,
        calories: stats.caloriesBurned,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,day_number' }
    );

    if (error) throw error;

    const completedDays = await getCompletedDays(userId);
    const completions = await getWorkoutCompletions(userId);
    const streak = calculateStreak(completedDays);

    return { completedDays, completions, currentStreak: streak };
  } catch (err) {
    console.error('Failed to mark day as completed', err);
    throw err;
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

export async function getWeightLogs(targetUserId?: string): Promise<WeightEntry[]> {
  try {
    const userId = await getActiveUserId(targetUserId);
    if (!userId) return [];

    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_on', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      return data.map((r) => ({
        id: `weight-${r.logged_on}`,
        date: r.logged_on,
        weight: Number(r.weight_kg),
      }));
    }

    // If no weight logs exist yet, check profile to seed initial weight log
    const profile = await getUserProfile(userId);
    if (profile?.weight) {
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('weight_logs').upsert(
        {
          user_id: userId,
          weight_kg: profile.weight,
          logged_on: today,
        },
        { onConflict: 'user_id,logged_on' }
      );
      return [
        {
          id: `weight-${today}`,
          date: today,
          weight: profile.weight,
        },
      ];
    }

    return [];
  } catch (err) {
    console.error('Failed to get weight logs:', err);
    throw err;
  }
}

export async function addWeightLog(
  weight: number,
  dateStr?: string,
  targetUserId?: string
): Promise<WeightEntry[]> {
  try {
    const userId = await getActiveUserId(targetUserId);
    if (!userId) throw new Error('User not authenticated');

    const date = dateStr || new Date().toISOString().split('T')[0];
    const weight_kg = parseFloat(weight.toFixed(1));

    const { error } = await supabase.from('weight_logs').upsert(
      {
        user_id: userId,
        weight_kg,
        logged_on: date,
      },
      { onConflict: 'user_id,logged_on' }
    );

    if (error) throw error;

    // Keep profile current weight in sync
    await saveUserProfile({ weight: weight_kg }, userId);

    return await getWeightLogs(userId);
  } catch (err) {
    console.error('Failed to add weight log', err);
    throw err;
  }
}

// ==========================================
// REST TIME SETTING APIS
// ==========================================

export async function getRestTimeSetting(targetUserId?: string): Promise<number> {
  try {
    const profile = await getUserProfile(targetUserId);
    return profile?.restSeconds || 20;
  } catch {
    return 20;
  }
}

export async function saveRestTimeSetting(seconds: number, targetUserId?: string): Promise<void> {
  try {
    const userId = await getActiveUserId(targetUserId);
    if (!userId) return;
    await supabase
      .from('profiles')
      .update({ rest_seconds: seconds })
      .eq('id', userId);
  } catch (err) {
    console.error('Failed to save rest time setting', err);
    throw err;
  }
}

// ==========================================
// RESET APIS
// ==========================================

export async function resetWorkoutProgress(targetUserId?: string): Promise<void> {
  try {
    const userId = await getActiveUserId(targetUserId);
    if (!userId) return;

    const { error } = await supabase
      .from('workout_logs')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  } catch (err) {
    console.error('Failed to reset workout progress', err);
    throw err;
  }
}

export async function resetAllData(targetUserId?: string): Promise<void> {
  try {
    const userId = await getActiveUserId(targetUserId);
    if (!userId) return;

    await supabase.from('workout_logs').delete().eq('user_id', userId);
    await supabase.from('weight_logs').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);
  } catch (err) {
    console.error('Failed to reset app data', err);
    throw err;
  }
}

// ==========================================
// MIGRATION HELPER (Requirement 7)
// ==========================================

export async function migrateLocalStorageToSupabase(userId: string): Promise<void> {
  if (!userId) return;

  const STORAGE_KEYS = {
    PROFILE: 'homefit30_user_profile',
    COMPLETED_DAYS: 'homefit30_completed_days',
    COMPLETIONS: 'homefit30_completions',
    ONBOARDING_STATUS: 'homefit30_onboarding_done',
    WEIGHT_LOGS: 'homefit30_weight_logs',
    REST_TIME: 'homefit30_rest_time',
  };

  try {
    const rawProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    const rawCompletions = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    const rawCompletedDays = localStorage.getItem(STORAGE_KEYS.COMPLETED_DAYS);
    const rawWeightLogs = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
    const rawRestTime = localStorage.getItem(STORAGE_KEYS.REST_TIME);

    if (!rawProfile && !rawCompletions && !rawCompletedDays && !rawWeightLogs) {
      return;
    }

    // Check if Supabase profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (rawProfile && !existingProfile) {
      try {
        const p: Partial<UserProfile> = JSON.parse(rawProfile);
        await supabase.from('profiles').upsert({
          id: userId,
          name: p.name || 'Athlete',
          gender: p.gender || 'male',
          age: p.age || 26,
          height_cm: p.height || 175,
          weight_kg: p.weight || 72,
          goal: p.goal || 'lose_belly_fat',
          focus_area: p.focusArea || 'chest',
          equipment: p.equipment || ['none'],
          rest_seconds: rawRestTime ? parseInt(rawRestTime, 10) || 20 : 20,
          plan_start_date: p.createdAt || new Date().toISOString(),
        });
      } catch (err) {
        console.error('Profile migration failed:', err);
      }
    }

    if (rawCompletions) {
      try {
        const completions: WorkoutCompletion[] = JSON.parse(rawCompletions);
        if (Array.isArray(completions) && completions.length > 0) {
          const rows = completions.map((c) => ({
            user_id: userId,
            day_number: c.day,
            duration_seconds: Math.round((c.durationMinutes || 1) * 60),
            calories: c.caloriesBurned || 0,
            completed_at: c.completedAt || new Date().toISOString(),
          }));
          await supabase.from('workout_logs').upsert(rows, { onConflict: 'user_id,day_number' });
        }
      } catch (err) {
        console.error('Completions migration failed:', err);
      }
    } else if (rawCompletedDays) {
      try {
        const days: number[] = JSON.parse(rawCompletedDays);
        if (Array.isArray(days) && days.length > 0) {
          const rows = days.map((d) => ({
            user_id: userId,
            day_number: d,
            duration_seconds: 900,
            calories: 120,
            completed_at: new Date().toISOString(),
          }));
          await supabase.from('workout_logs').upsert(rows, { onConflict: 'user_id,day_number' });
        }
      } catch (err) {
        console.error('Completed days migration failed:', err);
      }
    }

    if (rawWeightLogs) {
      try {
        const weightLogs: WeightEntry[] = JSON.parse(rawWeightLogs);
        if (Array.isArray(weightLogs) && weightLogs.length > 0) {
          const rows = weightLogs.map((w) => ({
            user_id: userId,
            weight_kg: w.weight,
            logged_on: w.date,
          }));
          await supabase.from('weight_logs').upsert(rows, { onConflict: 'user_id,logged_on' });
        }
      } catch (err) {
        console.error('Weight logs migration failed:', err);
      }
    }

    // Clear local storage keys
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem('homefit30_migrated_v4');
    localStorage.removeItem('homefit30_auth_user');
  } catch (err) {
    console.error('Error migrating localStorage to Supabase:', err);
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
