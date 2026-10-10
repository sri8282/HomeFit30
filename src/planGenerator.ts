/**
 * planGenerator.ts
 * Generates personalized 30-day workout plans for HomeFit 30 based on user metrics,
 * equipment availability, focus area, and progressive overload.
 */

import React from 'react';
import {
  ClassicCrunchesAnimation,
  ToeTouchReachAnimation,
  ButterflyCrunchesAnimation,
  DumbbellWeightedCrunchesAnimation,
  BenchAbdominalCrunchesAnimation,
  BandKneelingCrunchAnimation,
  KettlebellSitUpPressAnimation,
  ReverseCrunchToToeReachAnimation,
  LyingLegRaisesAnimation,
  FlutterKicksAnimation,
  ReverseCrunchesAnimation,
  DeadBugHoldsAnimation,
  HollowBodyCompressionAnimation,
  BenchLegPullInsAnimation,
  HangingKneeRaisesAnimation,
  HangingToesToBarAnimation,
  BandLegDriveAnimation,
  RussianTwistsAnimation,
  BicycleCrunchesAnimation,
  SidePlankStaticHoldAnimation,
  HeelTouchesAnimation,
  SidePlankHipDipsAnimation,
  DumbbellRussianTwistsAnimation,
  StandingDumbbellSideBendsAnimation,
  CrossBodyMountainClimbersAnimation,
  KettlebellWindmillAnimation,
  BandWoodchoppersAnimation,
  JumpingJacksAnimation,
  AirSquatsAnimation,
  StandardPushUpsAnimation,
  MountainClimbersAnimation,
  FullBodyBurpeesAnimation,
  DumbbellGobletSquatsAnimation,
  DumbbellRenegadeRowsAnimation,
  KettlebellSwingsAnimation,
  SpeedJumpRopeAnimation,
  StrictPullUpsAnimation,
  BenchStepUpsAnimation,
  BenchInclinePushUpsAnimation,
  BandThrustersAnimation,
  DumbbellFloorPressAnimation,
  DumbbellFlyFloorAnimation,
  DumbbellPulloverAnimation,
  SqueezePressAnimation,
  InclineDumbbellPressAnimation,
  DumbbellRowAnimation,
  DumbbellShoulderPressAnimation,
  HighKneesAnimation,
  DiamondPushUpsAnimation,
  WidePushUpsAnimation,
  DeclinePushUpsAnimation,
  PushUpBottomIsometricHoldAnimation,
} from './animations';

export type TargetArea =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'upper abs'
  | 'lower abs'
  | 'obliques'
  | 'full body';

export type FocusArea = 'chest' | 'abs' | 'full_body';

export type Equipment =
  | 'none'
  | 'dumbbell'
  | 'pullup_bar'
  | 'bench'
  | 'band'
  | 'kettlebell'
  | 'jump_rope';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type UserLevel = 'beginner' | 'intermediate';

export interface PlanExercise {
  id: string;
  name: string;
  targetArea: TargetArea;
  equipment: Equipment;
  secondaryEquipment?: Equipment;
  reps?: number;
  seconds?: number;
  sets?: number;
  difficulty: Difficulty;
  instructions: string[];
  animationType: string;
  restAfterSeconds: number;
  animation: React.ComponentType<{ className?: string }>;
}

export interface DayWorkoutPlan {
  day: number;
  title: string;
  subtitle: string;
  targetFocus: string;
  focusLabel: string;
  shortFocus: string;
  durationMinutes: number;
  estimatedCalories: number;
  isRestDay: boolean;
  difficultyLevel: Difficulty;
  weekNumber: number;
  exercises: PlanExercise[];
}

export interface UserFitnessAssessment {
  bmi: number;
  level: UserLevel;
  reason: string;
}

/**
 * Time estimate rules:
 * - Rep-based exercise: reps × 3 seconds × sets.
 * - Timed exercise: seconds × sets.
 * - Add 20 seconds rest between sets and between exercises.
 * - Add 3 seconds "get ready" before each exercise.
 * - Round the total to the nearest minute.
 */
export function calculateExerciseEstimatedSeconds(ex: {
  reps?: number;
  seconds?: number;
  durationSeconds?: number;
  sets?: number;
}): number {
  const sets = ex.sets && ex.sets > 0 ? ex.sets : 1;
  const isRepBased = typeof ex.reps === 'number' && ex.reps > 0;
  const activeSeconds = isRepBased
    ? (ex.reps! * 3 * sets)
    : ((ex.seconds || ex.durationSeconds || 30) * sets);
  const restBetweenSets = (sets - 1) * 20;
  const getReady = 3;
  return getReady + activeSeconds + restBetweenSets;
}

export function formatExerciseEstimatedTime(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (secs === 0) {
    return `${mins} min`;
  }
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
}

export function calculateDayEstimatedMinutes(exercises: Array<{
  reps?: number;
  seconds?: number;
  durationSeconds?: number;
  sets?: number;
}>): number {
  if (!exercises || exercises.length === 0) return 0;

  let totalSeconds = 0;
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    totalSeconds += calculateExerciseEstimatedSeconds(ex);
  }

  // Add 20 seconds rest between exercises
  if (exercises.length > 1) {
    totalSeconds += (exercises.length - 1) * 20;
  }

  return Math.max(1, Math.round(totalSeconds / 60));
}

// ==========================================
// 1. COMPREHENSIVE EXERCISE CATALOG
// ==========================================

export const EXERCISE_CATALOG: PlanExercise[] = [
  // --- CHEST (Dumbbells & Push-Up Variations) ---
  {
    id: 'ch-1',
    name: 'Dumbbell Floor Press',
    targetArea: 'chest',
    equipment: 'dumbbell',
    reps: 12,
    difficulty: 'beginner',
    instructions: [
      'Lie flat on the floor with knees bent and feet flat.',
      'Hold dumbbells at chest level with upper arms resting on the floor.',
      'Press dumbbells upward until arms are straight, squeezing upper chest.',
      'Lower under control until upper arms touch the floor gently.',
    ],
    animationType: 'pushup',
    restAfterSeconds: 20,
    animation: DumbbellFloorPressAnimation,
  },
  {
    id: 'ch-2',
    name: 'Dumbbell Fly (floor)',
    targetArea: 'chest',
    equipment: 'dumbbell',
    reps: 12,
    difficulty: 'intermediate',
    instructions: [
      'Lie on back holding dumbbells vertically above chest with elbows slightly unlocked.',
      'Open arms wide in an arc until triceps gently touch floor.',
      'Engage pectorals to bring dumbbells back together above chest.',
    ],
    animationType: 'pushup',
    restAfterSeconds: 20,
    animation: DumbbellFlyFloorAnimation,
  },
  {
    id: 'ch-3',
    name: 'Dumbbell Pullover',
    targetArea: 'chest',
    equipment: 'dumbbell',
    reps: 12,
    difficulty: 'intermediate',
    instructions: [
      'Lie on floor or bench holding one dumbbell overhead with both hands cup-gripped.',
      'Slowly lower the dumbbell back past head in a controlled arc.',
      'Pull dumbbell back over chest squeezing pectorals and serratus.',
    ],
    animationType: 'pushup',
    restAfterSeconds: 20,
    animation: DumbbellPulloverAnimation,
  },
  {
    id: 'ch-4',
    name: 'Squeeze Press',
    targetArea: 'chest',
    equipment: 'dumbbell',
    reps: 12,
    difficulty: 'intermediate',
    instructions: [
      'Lie flat on floor pressing two hex dumbbells firmly together against each other.',
      'Maintain forceful inward tension while pressing up toward lockout.',
      'Lower under steady squeeze to mid-chest.',
    ],
    animationType: 'pushup',
    restAfterSeconds: 20,
    animation: SqueezePressAnimation,
  },
  {
    id: 'ch-5',
    name: 'Incline Dumbbell Press',
    targetArea: 'chest',
    equipment: 'dumbbell',
    secondaryEquipment: 'bench',
    reps: 12,
    difficulty: 'intermediate',
    instructions: [
      'Lie on bench inclined at 30 to 45 degrees.',
      'Press dumbbells vertically upward directly over upper chest line.',
      'Lower with control until elbows form a 90-degree angle.',
    ],
    animationType: 'pushup',
    restAfterSeconds: 20,
    animation: InclineDumbbellPressAnimation,
  },
  {
    id: 'ch-6',
    name: 'Standard Push-Ups',
    targetArea: 'chest',
    equipment: 'none',
    reps: 14,
    difficulty: 'beginner',
    instructions: [
      'Hands slightly wider than shoulder-width, rigid plank bodyline.',
      'Lower chest until 2 inches above the ground with elbows at 45 degrees.',
      'Press through whole palms to complete lockout.',
    ],
    animationType: 'pushup',
    restAfterSeconds: 20,
    animation: StandardPushUpsAnimation,
  },
  {
    id: 'ch-7',
    name: 'Diamond Push-Ups',
    targetArea: 'chest',
    equipment: 'none',
    reps: 10,
    difficulty: 'intermediate',
    instructions: [
      'Place thumbs and index fingers together on floor under chest forming a diamond.',
      'Lower chest toward center of hands, keeping elbows close to ribs.',
      'Press up explosively focusing on inner chest and triceps.',
    ],
    animationType: 'pushup',
    restAfterSeconds: 20,
    animation: DiamondPushUpsAnimation,
  },
  {
    id: 'ch-8',
    name: 'Wide Grip Push-Ups',
    targetArea: 'chest',
    equipment: 'none',
    reps: 14,
    difficulty: 'beginner',
    instructions: [
      'Position hands wider than normal pushup stance to emphasize outer pectorals.',
      'Descend smoothly with full chest stretch.',
      'Drive upward powerfully.',
    ],
    animationType: 'pushup',
    restAfterSeconds: 20,
    animation: WidePushUpsAnimation,
  },
  {
    id: 'ch-9',
    name: 'Bench Incline Push-Ups',
    targetArea: 'chest',
    equipment: 'bench',
    reps: 15,
    difficulty: 'beginner',
    instructions: [
      'Hands on the bench, feet on floor in strong plank.',
      'Lower chest to edge of bench and push back up with chest squeeze.',
    ],
    animationType: 'pushup',
    restAfterSeconds: 20,
    animation: BenchInclinePushUpsAnimation,
  },
  {
    id: 'ch-11',
    name: 'Decline Push-Ups',
    targetArea: 'chest',
    equipment: 'none',
    reps: 12,
    difficulty: 'intermediate',
    instructions: [
      'Elevate toes on a step or couch, hands on floor beneath shoulders.',
      'Lower upper chest down toward the ground at a controlled 45-degree angle.',
      'Press upward locking out clavicular pectoral fibers.',
    ],
    animationType: 'pushup',
    restAfterSeconds: 20,
    animation: DeclinePushUpsAnimation,
  },
  {
    id: 'ch-12',
    name: 'Push-Up Bottom Isometric Hold',
    targetArea: 'chest',
    equipment: 'none',
    seconds: 35,
    difficulty: 'intermediate',
    instructions: [
      'Descend to 2 inches off the floor in push-up stance.',
      'Hold the bottom squeeze isometrically with pectorals maximally contracted.',
    ],
    animationType: 'pushup',
    restAfterSeconds: 20,
    animation: PushUpBottomIsometricHoldAnimation,
  },

  // --- BACK & SHOULDERS ---
  {
    id: 'bk-1',
    name: 'Dumbbell Row',
    targetArea: 'back',
    equipment: 'dumbbell',
    reps: 12,
    difficulty: 'beginner',
    instructions: [
      'Hinge forward at hips with flat back, dumbbells hanging below chest.',
      'Row dumbbells up toward hip pockets, driving elbows back.',
      'Squeeze shoulder blades together firmly at top of stroke.',
    ],
    animationType: 'dumbbell_row',
    restAfterSeconds: 20,
    animation: DumbbellRowAnimation,
  },
  {
    id: 'sh-1',
    name: 'Dumbbell Shoulder Press',
    targetArea: 'shoulders',
    equipment: 'dumbbell',
    reps: 12,
    difficulty: 'intermediate',
    instructions: [
      'Stand tall with dumbbells held at shoulder level, palms facing forward.',
      'Press dumbbells straight overhead until arms lock out.',
      'Lower smoothly back to clavicle height.',
    ],
    animationType: 'pushup',
    restAfterSeconds: 20,
    animation: DumbbellShoulderPressAnimation,
  },
  {
    id: 'fb-7',
    name: 'Dumbbell Renegade Rows',
    targetArea: 'back',
    equipment: 'dumbbell',
    reps: 12,
    difficulty: 'intermediate',
    instructions: [
      'In high plank position holding dumbbells resting on the floor.',
      'Row one dumbbell to ribcage while stabilizing hips and core.',
      'Alternate sides with steady control.',
    ],
    animationType: 'dumbbell_row',
    restAfterSeconds: 20,
    animation: DumbbellRenegadeRowsAnimation,
  },
  {
    id: 'fb-10',
    name: 'Strict Pull-Ups',
    targetArea: 'back',
    equipment: 'pullup_bar',
    reps: 8,
    difficulty: 'advanced',
    instructions: [
      'Overhand grip on bar, initiate pull with lats.',
      'Pull until chin clears bar, lower with controlled tempo.',
    ],
    animationType: 'pull_up',
    restAfterSeconds: 30,
    animation: StrictPullUpsAnimation,
  },

  // --- CARDIO & FAT BURN ---
  {
    id: 'fb-1',
    name: 'Jumping Jacks',
    targetArea: 'full body',
    equipment: 'none',
    seconds: 45,
    difficulty: 'beginner',
    instructions: [
      'Stand feet together, arms at side.',
      'Jump feet wide and clap hands overhead, landing softly on balls of feet.',
    ],
    animationType: 'jumping_jack',
    restAfterSeconds: 20,
    animation: JumpingJacksAnimation,
  },
  {
    id: 'fb-5',
    name: 'Full Body Burpees',
    targetArea: 'full body',
    equipment: 'none',
    reps: 10,
    difficulty: 'intermediate',
    instructions: [
      'Drop hands to floor, kick feet back to plank.',
      'Perform push-up, jump feet back to hands, explode upward with arms raised.',
    ],
    animationType: 'burpee',
    restAfterSeconds: 20,
    animation: FullBodyBurpeesAnimation,
  },
  {
    id: 'fb-4',
    name: 'Mountain Climbers',
    targetArea: 'full body',
    equipment: 'none',
    seconds: 40,
    difficulty: 'beginner',
    instructions: [
      'High plank position with flat back.',
      'Drive knees forward in an alternating sprinting rhythm.',
    ],
    animationType: 'mountain_climber',
    restAfterSeconds: 20,
    animation: MountainClimbersAnimation,
  },
  {
    id: 'fb-14',
    name: 'High Knees',
    targetArea: 'full body',
    equipment: 'none',
    seconds: 40,
    difficulty: 'beginner',
    instructions: [
      'Run in place driving knees up to hip height.',
      'Pump arms synchronously with rapid foot speed.',
    ],
    animationType: 'jumping_jack',
    restAfterSeconds: 20,
    animation: HighKneesAnimation,
  },
  {
    id: 'fb-6',
    name: 'Dumbbell Goblet Squats',
    targetArea: 'full body',
    equipment: 'dumbbell',
    reps: 14,
    difficulty: 'intermediate',
    instructions: [
      'Hold dumbbell vertically against chest.',
      'Squat deep with chest tall, drive up through heels.',
    ],
    animationType: 'squat',
    restAfterSeconds: 20,
    animation: DumbbellGobletSquatsAnimation,
  },
  {
    id: 'fb-2',
    name: 'Air Squats',
    targetArea: 'full body',
    equipment: 'none',
    reps: 18,
    difficulty: 'beginner',
    instructions: [
      'Feet shoulder-width apart, chest tall.',
      'Sit hips down and back until thighs parallel to ground.',
      'Drive through whole foot to stand tall.',
    ],
    animationType: 'squat',
    restAfterSeconds: 20,
    animation: AirSquatsAnimation,
  },
  {
    id: 'fb-8',
    name: 'Kettlebell Swings',
    targetArea: 'full body',
    equipment: 'kettlebell',
    seconds: 40,
    difficulty: 'intermediate',
    instructions: [
      'Hike bell back between thighs, snap hips forward aggressively.',
      'Float bell to chest height and hinge smoothly back down.',
    ],
    animationType: 'kettlebell_swing',
    restAfterSeconds: 20,
    animation: KettlebellSwingsAnimation,
  },
  {
    id: 'fb-9',
    name: 'Speed Jump Rope',
    targetArea: 'full body',
    equipment: 'jump_rope',
    seconds: 50,
    difficulty: 'intermediate',
    instructions: [
      'Light bounces on balls of feet with fast wrists.',
      'Sustained high cardio heart rate output.',
    ],
    animationType: 'jump_rope',
    restAfterSeconds: 20,
    animation: SpeedJumpRopeAnimation,
  },
  {
    id: 'fb-11',
    name: 'Bench Step-Ups with Knee Drive',
    targetArea: 'full body',
    equipment: 'bench',
    reps: 16,
    difficulty: 'beginner',
    instructions: [
      'Step one foot firmly on the bench, drive body up.',
      'Lift trailing knee high at top before stepping down gently.',
    ],
    animationType: 'lunge',
    restAfterSeconds: 20,
    animation: BenchStepUpsAnimation,
  },
  {
    id: 'fb-13',
    name: 'Resistance Band Thrusters',
    targetArea: 'full body',
    equipment: 'band',
    reps: 14,
    difficulty: 'intermediate',
    instructions: [
      'Stand on center of band, hold handles at shoulder level.',
      'Squat down and explosively press overhead as you stand.',
    ],
    animationType: 'squat',
    restAfterSeconds: 20,
    animation: BandThrustersAnimation,
  },

  // --- CORE & ABS ---
  {
    id: 'ua-1',
    name: 'Classic Crunches',
    targetArea: 'upper abs',
    equipment: 'none',
    reps: 15,
    difficulty: 'beginner',
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor.',
      'Place hands gently behind ears without pulling your neck.',
      'Curl shoulders toward pelvis, squeezing upper abdominal wall.',
    ],
    animationType: 'crunch',
    restAfterSeconds: 20,
    animation: ClassicCrunchesAnimation,
  },
  {
    id: 'ua-2',
    name: 'Toe Touch Reach',
    targetArea: 'upper abs',
    equipment: 'none',
    reps: 16,
    difficulty: 'beginner',
    instructions: [
      'Lie on back with legs extended straight up toward the ceiling.',
      'Reach hands up toward your toes by contracting upper abs.',
      'Lower shoulders under control with steady breath.',
    ],
    animationType: 'crunch',
    restAfterSeconds: 20,
    animation: ToeTouchReachAnimation,
  },
  {
    id: 'ua-3',
    name: 'Butterfly Crunches',
    targetArea: 'upper abs',
    equipment: 'none',
    reps: 16,
    difficulty: 'beginner',
    instructions: [
      'Place soles of feet together with knees dropped out wide in diamond shape.',
      'Curl forward through upper abs and touch floor between feet.',
    ],
    animationType: 'crunch',
    restAfterSeconds: 20,
    animation: ButterflyCrunchesAnimation,
  },
  {
    id: 'ua-4',
    name: 'Dumbbell Weighted Crunches',
    targetArea: 'upper abs',
    equipment: 'dumbbell',
    reps: 12,
    difficulty: 'intermediate',
    instructions: [
      'Hold a dumbbell across upper chest while lying flat with knees bent.',
      'Contract upper abdominals forcefully against resistance.',
    ],
    animationType: 'crunch',
    restAfterSeconds: 20,
    animation: DumbbellWeightedCrunchesAnimation,
  },
  {
    id: 'ua-5',
    name: 'Bench Abdominal Crunches',
    targetArea: 'upper abs',
    equipment: 'bench',
    reps: 15,
    difficulty: 'intermediate',
    instructions: [
      'Lie flat along the workout bench with knees bent and feet elevated.',
      'Crunch upward, focusing on spinal flexion without hip engagement.',
    ],
    animationType: 'crunch',
    restAfterSeconds: 20,
    animation: BenchAbdominalCrunchesAnimation,
  },
  {
    id: 'ua-6',
    name: 'Resistance Band Kneeling Crunch',
    targetArea: 'upper abs',
    equipment: 'band',
    reps: 15,
    difficulty: 'intermediate',
    instructions: [
      'Kneel holding resistance band overhead at chest height.',
      'Crunch downward, flexing spine and drawing elbows toward hips.',
    ],
    animationType: 'crunch',
    restAfterSeconds: 20,
    animation: BandKneelingCrunchAnimation,
  },
  {
    id: 'ua-7',
    name: 'Kettlebell Sit-Up Press',
    targetArea: 'upper abs',
    equipment: 'kettlebell',
    reps: 10,
    difficulty: 'advanced',
    instructions: [
      'Lie flat holding kettlebell in two hands on chest.',
      'Perform full sit-up and press kettlebell straight overhead at the top.',
    ],
    animationType: 'crunch',
    restAfterSeconds: 25,
    animation: KettlebellSitUpPressAnimation,
  },
  {
    id: 'ua-8',
    name: 'Reverse Crunch to Toe Reach',
    targetArea: 'upper abs',
    equipment: 'none',
    reps: 14,
    difficulty: 'intermediate',
    instructions: [
      'Lift hips slightly in reverse crunch, then extend legs and reach for toes.',
      'Continuous compound tension through whole rectus abdominis.',
    ],
    animationType: 'crunch',
    restAfterSeconds: 20,
    animation: ReverseCrunchToToeReachAnimation,
  },

  // --- LOWER ABS ---
  {
    id: 'la-1',
    name: 'Lying Leg Raises',
    targetArea: 'lower abs',
    equipment: 'none',
    reps: 14,
    difficulty: 'beginner',
    instructions: [
      'Lie on your back, hands under hips to protect lumbar curve.',
      'Raise straight legs together until vertical.',
      'Lower legs slowly, hovering heels 2 inches above the ground.',
    ],
    animationType: 'plank',
    restAfterSeconds: 20,
    animation: LyingLegRaisesAnimation,
  },
  {
    id: 'la-2',
    name: 'Flutter Kicks',
    targetArea: 'lower abs',
    equipment: 'none',
    seconds: 35,
    difficulty: 'beginner',
    instructions: [
      'Keep lower back pressed flat into the floor.',
      'Kick legs up and down in rapid, small, scissor-like rhythmic motions.',
    ],
    animationType: 'plank',
    restAfterSeconds: 20,
    animation: FlutterKicksAnimation,
  },
  {
    id: 'la-3',
    name: 'Reverse Crunches',
    targetArea: 'lower abs',
    equipment: 'none',
    reps: 15,
    difficulty: 'beginner',
    instructions: [
      'Knees bent at 90 degrees, pull knees toward chest.',
      'Roll pelvis slightly off floor and squeeze lower abs at peak.',
    ],
    animationType: 'crunch',
    restAfterSeconds: 20,
    animation: ReverseCrunchesAnimation,
  },
  {
    id: 'la-4',
    name: 'Dead Bug Holds',
    targetArea: 'lower abs',
    equipment: 'none',
    reps: 16,
    difficulty: 'beginner',
    instructions: [
      'Back flat on floor, arms straight up, knees bent at 90 degrees.',
      'Extend opposite arm and leg simultaneously without arching back.',
    ],
    animationType: 'plank',
    restAfterSeconds: 20,
    animation: DeadBugHoldsAnimation,
  },
  {
    id: 'la-5',
    name: 'Hollow Body Compression',
    targetArea: 'lower abs',
    equipment: 'none',
    seconds: 30,
    difficulty: 'intermediate',
    instructions: [
      'Press lower back into floor, extend arms overhead and legs straight out.',
      'Create a rigid banana curve, breathing shallowly through brace.',
    ],
    animationType: 'plank',
    restAfterSeconds: 20,
    animation: HollowBodyCompressionAnimation,
  },
  {
    id: 'la-6',
    name: 'Bench Leg Pull-Ins',
    targetArea: 'lower abs',
    equipment: 'bench',
    reps: 16,
    difficulty: 'intermediate',
    instructions: [
      'Sit on edge of bench holding edges for support.',
      'Lean back slightly and pull knees into chest, then extend forward.',
    ],
    animationType: 'crunch',
    restAfterSeconds: 20,
    animation: BenchLegPullInsAnimation,
  },
  {
    id: 'la-7',
    name: 'Hanging Knee Raises',
    targetArea: 'lower abs',
    equipment: 'pullup_bar',
    reps: 12,
    difficulty: 'intermediate',
    instructions: [
      'Dead hang from bar with core pre-tensioned.',
      'Raise knees up to chest level without swinging or kipping.',
    ],
    animationType: 'pull_up',
    restAfterSeconds: 25,
    animation: HangingKneeRaisesAnimation,
  },
  {
    id: 'la-8',
    name: 'Hanging Toes to Bar',
    targetArea: 'lower abs',
    equipment: 'pullup_bar',
    reps: 8,
    difficulty: 'advanced',
    instructions: [
      'Hang from pull-up bar, pivot through hips and lats.',
      'Drive straight toes all the way to touch the bar.',
    ],
    animationType: 'pull_up',
    restAfterSeconds: 30,
    animation: HangingToesToBarAnimation,
  },
  {
    id: 'la-9',
    name: 'Resistance Band Leg Drive',
    targetArea: 'lower abs',
    equipment: 'band',
    reps: 14,
    difficulty: 'intermediate',
    instructions: [
      'Loop band around feet while lying on back.',
      'Drive one leg out against resistance while holding the other stable.',
    ],
    animationType: 'plank',
    restAfterSeconds: 20,
    animation: BandLegDriveAnimation,
  },

  // --- OBLIQUES ---
  {
    id: 'ob-1',
    name: 'Russian Twists',
    targetArea: 'obliques',
    equipment: 'none',
    reps: 20,
    difficulty: 'beginner',
    instructions: [
      'Sit with knees bent, lean torso back at 45 degrees with feet lifted.',
      'Rotate torso side-to-side, tapping hands on floor by each hip.',
    ],
    animationType: 'crunch',
    restAfterSeconds: 20,
    animation: RussianTwistsAnimation,
  },
  {
    id: 'ob-2',
    name: 'Bicycle Crunches',
    targetArea: 'obliques',
    equipment: 'none',
    reps: 20,
    difficulty: 'beginner',
    instructions: [
      'Lie flat, bring opposite elbow to opposite knee with rotating torso.',
      'Extend other leg straight out at 45 degrees; alternate smoothly.',
    ],
    animationType: 'crunch',
    restAfterSeconds: 20,
    animation: BicycleCrunchesAnimation,
  },
  {
    id: 'ob-3',
    name: 'Side Plank Static Hold',
    targetArea: 'obliques',
    equipment: 'none',
    seconds: 35,
    difficulty: 'beginner',
    instructions: [
      'Elbow directly under shoulder, stack feet and raise hips high.',
      'Hold a straight line from shoulder to heels with engaged obliques.',
    ],
    animationType: 'plank',
    restAfterSeconds: 20,
    animation: SidePlankStaticHoldAnimation,
  },
  {
    id: 'ob-4',
    name: 'Heel Touches',
    targetArea: 'obliques',
    equipment: 'none',
    reps: 24,
    difficulty: 'beginner',
    instructions: [
      'Lie on back with knees bent, feet flat.',
      'Crunch side-to-side reaching fingers to tap each heel alternately.',
    ],
    animationType: 'crunch',
    restAfterSeconds: 20,
    animation: HeelTouchesAnimation,
  },
  {
    id: 'ob-5',
    name: 'Side Plank Hip Dips',
    targetArea: 'obliques',
    equipment: 'none',
    reps: 12,
    difficulty: 'intermediate',
    instructions: [
      'In side plank position, dip hips downward toward floor.',
      'Drive hips high above center line, squeezing bottom oblique.',
    ],
    animationType: 'plank',
    restAfterSeconds: 20,
    animation: SidePlankHipDipsAnimation,
  },
  {
    id: 'ob-6',
    name: 'Dumbbell Russian Twists',
    targetArea: 'obliques',
    equipment: 'dumbbell',
    reps: 18,
    difficulty: 'intermediate',
    instructions: [
      'Hold a dumbbell in both hands across torso.',
      'Rotate fully across hips, maintaining balance with lifted feet.',
    ],
    animationType: 'crunch',
    restAfterSeconds: 20,
    animation: DumbbellRussianTwistsAnimation,
  },
  {
    id: 'ob-7',
    name: 'Standing Dumbbell Side Bends',
    targetArea: 'obliques',
    equipment: 'dumbbell',
    reps: 15,
    difficulty: 'intermediate',
    instructions: [
      'Stand upright holding dumbbell in one hand at thigh.',
      'Bend torso laterally toward the weight, then contract opposite oblique.',
    ],
    animationType: 'crunch',
    restAfterSeconds: 20,
    animation: StandingDumbbellSideBendsAnimation,
  },
  {
    id: 'ob-8',
    name: 'Cross-Body Mountain Climbers',
    targetArea: 'obliques',
    equipment: 'none',
    seconds: 40,
    difficulty: 'intermediate',
    instructions: [
      'In high plank, drive right knee diagonally toward left elbow.',
      'Alternate at rapid pace to shred rotational core.',
    ],
    animationType: 'mountain_climber',
    restAfterSeconds: 20,
    animation: CrossBodyMountainClimbersAnimation,
  },
  {
    id: 'ob-9',
    name: 'Kettlebell Windmill',
    targetArea: 'obliques',
    equipment: 'kettlebell',
    reps: 10,
    difficulty: 'advanced',
    instructions: [
      'Press kettlebell overhead with locked arm.',
      'Hinge at hip and slide other hand down front leg toward floor.',
    ],
    animationType: 'kettlebell_swing',
    restAfterSeconds: 25,
    animation: KettlebellWindmillAnimation,
  },
  {
    id: 'ob-10',
    name: 'Resistance Band Woodchoppers',
    targetArea: 'obliques',
    equipment: 'band',
    reps: 14,
    difficulty: 'intermediate',
    instructions: [
      'Anchor band high or low, grasp with both hands.',
      'Rotate through hips and torso diagonally against resistance.',
    ],
    animationType: 'crunch',
    restAfterSeconds: 20,
    animation: BandWoodchoppersAnimation,
  },
];

// ==========================================
// 2. BMI & USER LEVEL CALCULATION
// ==========================================

export function calculateUserFitnessLevel(
  heightCm: number,
  weightKg: number,
  age: number
): UserFitnessAssessment {
  if (!heightCm || !weightKg) {
    return { bmi: 22.0, level: 'intermediate', reason: 'Default profile baseline' };
  }

  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  const isBmiHigh = bmi > 27;
  const isAgeHigh = age > 45;

  if (isBmiHigh || isAgeHigh) {
    let reason = '';
    if (isBmiHigh && isAgeHigh) {
      reason = 'BMI > 27 and Age > 45 (Tailored joint-safe progression)';
    } else if (isBmiHigh) {
      reason = 'BMI > 27 (Optimized metabolic burn & low-impact calibration)';
    } else {
      reason = 'Age > 45 (Optimized longevity & recovery curves)';
    }

    return {
      bmi,
      level: 'beginner',
      reason,
    };
  }

  return {
    bmi,
    level: 'intermediate',
    reason: 'Standard athletic progression baseline',
  };
}

// ==========================================
// 3. EQUIPMENT FILTERING
// ==========================================

export function filterExercisesByEquipment(
  catalog: PlanExercise[],
  userEquipment: Equipment[]
): PlanExercise[] {
  const allowed = new Set<Equipment>(['none', ...(userEquipment || [])]);
  return catalog.filter((ex) => {
    if (!allowed.has(ex.equipment)) return false;
    if (ex.secondaryEquipment && !allowed.has(ex.secondaryEquipment)) return false;
    return true;
  });
}

// ==========================================
// 4. 30-DAY PROGRESSIVE PLAN GENERATOR
// ==========================================

export interface PlanGenerationInput {
  heightCm: number;
  weightKg: number;
  age: number;
  equipment: Equipment[];
  goal?: 'lose_belly_fat' | 'build_abs' | 'get_stronger';
  focusArea?: FocusArea;
}

/**
 * Generates a full 30-day workout plan based on user metrics, equipment, and focus area.
 * When Focus = Chest (default):
 * Weekly 7-day pattern repeated for 30 days:
 * Day 1: Chest heavy (5-7 chest moves)
 * Day 2: Back + core
 * Day 3: Chest volume (5-7 chest moves)
 * Day 4: Rest
 * Day 5: Chest + shoulders (5-7 moves)
 * Day 6: Full body fat burn (jumping jacks, burpees, mountain climbers, high knees)
 * Day 7: Rest
 *
 * CRITICAL RULE:
 * If user owns dumbbells, every workout day MUST include at least 3 dumbbell exercises!
 * Increase reps by ~10% each week.
 */
export function generate30DayWorkoutPlan(input: PlanGenerationInput): DayWorkoutPlan[] {
  const assessment = calculateUserFitnessLevel(input.heightCm, input.weightKg, input.age);
  const rawEq = input.equipment && input.equipment.length > 0 ? input.equipment : ['none'];
  const userEquipment: Equipment[] = rawEq.map((e: string) => {
    if (e === 'dumbbells') return 'dumbbell' as Equipment;
    if (e === 'pull_up_bar' || e === 'pull-up-bar') return 'pullup_bar' as Equipment;
    if (e === 'resistance_bands' || e === 'bands') return 'band' as Equipment;
    if (e === 'kettlebells') return 'kettlebell' as Equipment;
    if (e === 'jumprope' || e === 'jump-rope') return 'jump_rope' as Equipment;
    return e as Equipment;
  });
  const hasDumbbells = userEquipment.includes('dumbbell');
  const hasBench = userEquipment.includes('bench');
  const focusArea = input.focusArea || 'chest';

  const eligibleExercises = filterExercisesByEquipment(EXERCISE_CATALOG, userEquipment);

  const days: DayWorkoutPlan[] = [];

  for (let day = 1; day <= 30; day++) {
    const weekNumber = Math.min(4, Math.ceil(day / 7));
    const cycleDay = ((day - 1) % 7) + 1; // 1 to 7 cycle

    // Reps & duration progression: +10% each week
    const repMultiplier = 1 + (weekNumber - 1) * 0.10;
    const secMultiplier = 1 + (weekNumber - 1) * 0.10;

    let dayDifficulty: Difficulty = assessment.level === 'beginner' && weekNumber <= 2 ? 'beginner' : 'intermediate';
    if (weekNumber >= 4 && assessment.level !== 'beginner') dayDifficulty = 'advanced';

    // ----------------------------------------------------
    // REST DAYS: Cycle Days 4 & 7
    // ----------------------------------------------------
    if (cycleDay === 4 || cycleDay === 7) {
      const restMoves: PlanExercise[] = [
        {
          id: `d${day}-rest-1`,
          name: 'Cat-Cow Spinal Mobility',
          targetArea: 'full body',
          equipment: 'none',
          seconds: 60,
          sets: 1,
          difficulty: 'beginner',
          instructions: [
            'Hands and knees on floor, arch spine toward ceiling on exhale.',
            'Inhale and drop belly toward floor while opening chest.',
          ],
          animationType: 'plank',
          restAfterSeconds: 20,
          animation: HollowBodyCompressionAnimation,
        },
        {
          id: `d${day}-rest-2`,
          name: 'Hip Flexor Deep Lunge Stretch',
          targetArea: 'lower abs',
          equipment: 'none',
          seconds: 60,
          sets: 1,
          difficulty: 'beginner',
          instructions: [
            'Take a gentle low lunge stance, tucking tailbone to stretch front hip.',
            'Hold for 30s per leg with steady nasal breathing.',
          ],
          animationType: 'lunge',
          restAfterSeconds: 20,
          animation: BenchStepUpsAnimation,
        },
        {
          id: `d${day}-rest-3`,
          name: 'Child’s Pose Diaphragmatic Breath',
          targetArea: 'upper abs',
          equipment: 'none',
          seconds: 90,
          sets: 1,
          difficulty: 'beginner',
          instructions: [
            'Knees wide, sink hips back to heels and extend arms forward on mat.',
            'Deep rhythmic belly breaths to accelerate central nervous system recovery.',
          ],
          animationType: 'plank',
          restAfterSeconds: 0,
          animation: DeadBugHoldsAnimation,
        },
      ];

      days.push({
        day,
        weekNumber,
        title: `Day ${day} · Rest`,
        subtitle: 'Joint Decompression & Active Mobility Flow',
        targetFocus: 'Rest',
        focusLabel: 'Rest',
        shortFocus: 'Rest',
        durationMinutes: calculateDayEstimatedMinutes(restMoves),
        estimatedCalories: 60,
        isRestDay: true,
        difficultyLevel: 'beginner',
        exercises: restMoves,
      });
      continue;
    }

    // ----------------------------------------------------
    // ACTIVE WORKOUT DAYS
    // ----------------------------------------------------
    let title = '';
    let subtitle = '';
    let targetFocus = '';
    let focusLabel = '';
    let shortFocus = '';
    const selectedList: PlanExercise[] = [];

    // Helper to find exercise by id in catalog
    const findEx = (id: string): PlanExercise | undefined => {
      return EXERCISE_CATALOG.find((e) => e.id === id);
    };

    // Helper to add exercise with week-based progressive overload
    const addExercise = (ex: PlanExercise | undefined) => {
      if (!ex) return;
      if (selectedList.some((e) => e.name === ex.name)) return; // avoid duplicate names in same workout

      // Check equipment eligibility
      if (ex.equipment !== 'none' && !userEquipment.includes(ex.equipment)) return;
      if (ex.secondaryEquipment && !userEquipment.includes(ex.secondaryEquipment)) return;

      selectedList.push({
        ...ex,
        id: `d${day}-ex${selectedList.length + 1}-${ex.id}`,
        reps: ex.reps ? Math.max(8, Math.round(ex.reps * repMultiplier)) : undefined,
        seconds: ex.seconds ? Math.max(25, Math.round(ex.seconds * secMultiplier)) : undefined,
        sets: 3,
        restAfterSeconds: 20,
      });
    };

    // Helper to ensure at least 3 dumbbell exercises are present
    const ensureDumbbellMinimum = (fallbackDumbbells: string[]) => {
      if (!hasDumbbells) return;
      const count = () => selectedList.filter((e) => e.equipment === 'dumbbell').length;

      for (const dbId of fallbackDumbbells) {
        if (count() >= 3) break;
        const ex = findEx(dbId);
        if (ex && !selectedList.some((e) => e.name === ex.name)) {
          addExercise(ex);
        }
      }

      // If still under 3, scan entire catalog for any eligible dumbbell moves
      if (count() < 3) {
        const allDb = eligibleExercises.filter((e) => e.equipment === 'dumbbell');
        for (const ex of allDb) {
          if (count() >= 3) break;
          if (!selectedList.some((e) => e.name === ex.name)) {
            addExercise(ex);
          }
        }
      }
    };

    if (focusArea === 'chest') {
      if (cycleDay === 1) {
        // DAY 1: CHEST HEAVY (5-7 chest moves)
        title = `Day ${day} · Chest Heavy`;
        subtitle = `Week ${weekNumber} Peak Mechanical Tension & Pectoral Mass`;
        targetFocus = 'Chest Heavy';
        focusLabel = 'Chest Heavy';
        shortFocus = 'Chest';

        if (hasDumbbells) {
          addExercise(findEx('ch-1')); // Dumbbell Floor Press
          addExercise(findEx('ch-4')); // Squeeze Press
          addExercise(findEx('ch-3')); // Dumbbell Pullover
          if (hasBench) addExercise(findEx('ch-5')); // Incline Dumbbell Press
          addExercise(findEx('ch-2')); // Dumbbell Fly (floor)
        }
        addExercise(findEx('ch-6')); // Standard Push-Ups
        addExercise(findEx('ch-7')); // Diamond Push-Ups
        addExercise(findEx('ch-8')); // Wide Grip Push-Ups
        if (!hasDumbbells) {
          addExercise(findEx('ch-11')); // Decline Push-Ups
          addExercise(findEx('ch-12')); // Push-Up Bottom Isometric Hold
          if (hasBench) addExercise(findEx('ch-9')); // Bench Incline Push-Ups
        }

        ensureDumbbellMinimum(['ch-1', 'ch-4', 'ch-2', 'ch-3', 'ch-5', 'sh-1', 'bk-1']);
      } else if (cycleDay === 2) {
        // DAY 2: BACK + CORE
        title = `Day ${day} · Back + Core`;
        subtitle = `Week ${weekNumber} Posterior Chain & Abdominal Stability`;
        targetFocus = 'Back & Core';
        focusLabel = 'Back + Core';
        shortFocus = 'Back + Core';

        if (hasDumbbells) {
          addExercise(findEx('bk-1')); // Dumbbell Row
          addExercise(findEx('fb-7')); // Dumbbell Renegade Rows
          addExercise(findEx('ua-4')); // Dumbbell Weighted Crunches
          addExercise(findEx('ob-6')); // Dumbbell Russian Twists
        }
        if (userEquipment.includes('pullup_bar')) addExercise(findEx('fb-10')); // Strict Pull-Ups
        addExercise(findEx('la-1')); // Lying Leg Raises
        addExercise(findEx('la-4')); // Dead Bug Holds
        addExercise(findEx('ua-3')); // Butterfly Crunches

        ensureDumbbellMinimum(['bk-1', 'fb-7', 'ua-4', 'ob-6', 'sh-1']);
      } else if (cycleDay === 3) {
        // DAY 3: CHEST VOLUME (5-7 chest moves)
        title = `Day ${day} · Chest`;
        subtitle = `Week ${weekNumber} High-Volume Metabolic Pectoral Pump`;
        targetFocus = 'Chest';
        focusLabel = 'Chest';
        shortFocus = 'Chest';

        if (hasDumbbells) {
          addExercise(findEx('ch-2')); // Dumbbell Fly (floor)
          addExercise(findEx('ch-1')); // Dumbbell Floor Press
          addExercise(findEx('ch-4')); // Squeeze Press
          addExercise(findEx('ch-3')); // Dumbbell Pullover
          if (hasBench) addExercise(findEx('ch-5')); // Incline DB Press
        }
        addExercise(findEx('ch-8')); // Wide Grip Push-Ups
        addExercise(findEx('ch-6')); // Standard Push-Ups
        addExercise(findEx('ch-7')); // Diamond Push-Ups
        if (!hasDumbbells) {
          addExercise(findEx('ch-11')); // Decline Push-Ups
          addExercise(findEx('ch-12')); // Push-Up Bottom Isometric Hold
        }

        ensureDumbbellMinimum(['ch-2', 'ch-1', 'ch-4', 'ch-3', 'ch-5', 'sh-1', 'bk-1']);
      } else if (cycleDay === 5) {
        // DAY 5: CHEST + SHOULDERS (5-7 moves)
        title = `Day ${day} · Chest + Shoulders`;
        subtitle = `Week ${weekNumber} Deltoid Drive & Upper Chest Density`;
        targetFocus = 'Chest & Shoulders';
        focusLabel = 'Chest + Shoulders';
        shortFocus = 'Chest + Shoulders';

        if (hasDumbbells) {
          addExercise(findEx('sh-1')); // Dumbbell Shoulder Press
          addExercise(findEx('ch-1')); // Dumbbell Floor Press
          addExercise(findEx('ch-2')); // Dumbbell Fly (floor)
          addExercise(findEx('ch-4')); // Squeeze Press
          addExercise(findEx('ch-3')); // Dumbbell Pullover
        }
        addExercise(findEx('ch-7')); // Diamond Push-Ups
        addExercise(findEx('ch-6')); // Standard Push-Ups
        addExercise(findEx('ob-8')); // Cross-Body Mountain Climbers
        if (!hasDumbbells) {
          addExercise(findEx('ch-8')); // Wide Grip Push-Ups
          addExercise(findEx('ch-11')); // Decline Push-Ups
        }

        ensureDumbbellMinimum(['sh-1', 'ch-1', 'ch-2', 'ch-4', 'ch-3', 'bk-1']);
      } else if (cycleDay === 6) {
        // DAY 6: FULL BODY FAT BURN
        title = `Day ${day} · Fat Burn`;
        subtitle = `Week ${weekNumber} High-Octane Calorie & Cardio Furnace`;
        targetFocus = 'Full Body Fat Burn';
        focusLabel = 'Fat Burn';
        shortFocus = 'Fat Burn';

        // Fat burn day MUST have jumping jacks, burpees, mountain climbers, high knees
        addExercise(findEx('fb-1'));  // Jumping Jacks
        addExercise(findEx('fb-5'));  // Full Body Burpees
        addExercise(findEx('fb-4'));  // Mountain Climbers
        addExercise(findEx('fb-14')); // High Knees

        // If user owns dumbbells, MUST include at least 3 dumbbell exercises!
        if (hasDumbbells) {
          addExercise(findEx('fb-6')); // Dumbbell Goblet Squats
          addExercise(findEx('fb-7')); // Dumbbell Renegade Rows
          addExercise(findEx('bk-1')); // Dumbbell Row
        }

        ensureDumbbellMinimum(['fb-6', 'fb-7', 'bk-1', 'ch-1', 'sh-1', 'ua-4']);
      }
    } else if (focusArea === 'abs') {
      // ABS FOCUS SPLIT
      if (cycleDay === 1) {
        title = `Day ${day} · Upper Abs & Core`;
        subtitle = `Week ${weekNumber} Rectus Abdominis Matrix`;
        targetFocus = 'Upper Abs';
        focusLabel = 'Upper Abs';
        shortFocus = 'Abs';

        if (hasDumbbells) {
          addExercise(findEx('ua-4')); // DB Weighted Crunches
          addExercise(findEx('ob-6')); // DB Russian Twists
          addExercise(findEx('fb-7')); // DB Renegade Rows
        }
        addExercise(findEx('ua-1')); // Classic Crunches
        addExercise(findEx('ua-2')); // Toe Touch Reach
        addExercise(findEx('ua-3')); // Butterfly Crunches
        ensureDumbbellMinimum(['ua-4', 'ob-6', 'fb-7', 'bk-1']);
      } else if (cycleDay === 2) {
        title = `Day ${day} · Lower Abs & Obliques`;
        subtitle = `Week ${weekNumber} Pelvic Stability & Rotational Core`;
        targetFocus = 'Lower Abs & Obliques';
        focusLabel = 'Lower Abs';
        shortFocus = 'Lower Abs';

        if (hasDumbbells) {
          addExercise(findEx('ob-6')); // DB Russian Twists
          addExercise(findEx('ob-7')); // Standing DB Side Bends
          addExercise(findEx('ua-4')); // DB Weighted Crunches
        }
        addExercise(findEx('la-1')); // Lying Leg Raises
        addExercise(findEx('la-2')); // Flutter Kicks
        addExercise(findEx('ob-2')); // Bicycle Crunches
        ensureDumbbellMinimum(['ob-6', 'ob-7', 'ua-4', 'fb-6']);
      } else if (cycleDay === 3) {
        title = `Day ${day} · Core Compression`;
        subtitle = `Week ${weekNumber} Isometric Wall & Anti-Extension`;
        targetFocus = 'Core Compression';
        focusLabel = 'Core Power';
        shortFocus = 'Core';

        if (hasDumbbells) {
          addExercise(findEx('bk-1')); // DB Row
          addExercise(findEx('ua-4')); // DB Weighted Crunches
          addExercise(findEx('fb-6')); // DB Goblet Squats
        }
        addExercise(findEx('la-4')); // Dead Bug Holds
        addExercise(findEx('la-5')); // Hollow Body Compression
        addExercise(findEx('ob-3')); // Side Plank
        ensureDumbbellMinimum(['bk-1', 'ua-4', 'fb-6', 'ob-6']);
      } else if (cycleDay === 5) {
        title = `Day ${day} · Oblique Shred`;
        subtitle = `Week ${weekNumber} Lateral Flexion & Tight Waistline`;
        targetFocus = 'Obliques';
        focusLabel = 'Obliques';
        shortFocus = 'Obliques';

        if (hasDumbbells) {
          addExercise(findEx('ob-6')); // DB Russian Twists
          addExercise(findEx('ob-7')); // DB Side Bends
          addExercise(findEx('fb-7')); // DB Renegade Rows
        }
        addExercise(findEx('ob-4')); // Heel Touches
        addExercise(findEx('ob-8')); // Cross-Body Climbers
        addExercise(findEx('la-3')); // Reverse Crunches
        ensureDumbbellMinimum(['ob-6', 'ob-7', 'fb-7', 'ua-4']);
      } else if (cycleDay === 6) {
        title = `Day ${day} · Core Fat Burn`;
        subtitle = `Week ${weekNumber} High Cardio Calorie Furnace`;
        targetFocus = 'Fat Burn';
        focusLabel = 'Fat Burn';
        shortFocus = 'Fat Burn';

        addExercise(findEx('fb-1'));  // Jumping Jacks
        addExercise(findEx('fb-5'));  // Burpees
        addExercise(findEx('fb-4'));  // Mountain Climbers
        addExercise(findEx('fb-14')); // High Knees
        if (hasDumbbells) {
          addExercise(findEx('fb-6')); // DB Goblet Squats
          addExercise(findEx('fb-7')); // DB Renegade Rows
          addExercise(findEx('bk-1')); // DB Row
        }
        ensureDumbbellMinimum(['fb-6', 'fb-7', 'bk-1']);
      }
    } else {
      // FULL BODY FOCUS SPLIT
      if (cycleDay === 1) {
        title = `Day ${day} · Full Body Strength`;
        subtitle = `Week ${weekNumber} Compound Tension & Density`;
        targetFocus = 'Total Body';
        focusLabel = 'Full Body';
        shortFocus = 'Full Body';

        if (hasDumbbells) {
          addExercise(findEx('ch-1')); // DB Floor Press
          addExercise(findEx('bk-1')); // DB Row
          addExercise(findEx('fb-6')); // DB Goblet Squats
        }
        addExercise(findEx('ch-6')); // Standard Push-Ups
        addExercise(findEx('fb-2')); // Air Squats
        addExercise(findEx('la-1')); // Lying Leg Raises
        ensureDumbbellMinimum(['ch-1', 'bk-1', 'fb-6', 'sh-1']);
      } else if (cycleDay === 2) {
        title = `Day ${day} · Upper Body & Core`;
        subtitle = `Week ${weekNumber} Push-Pull Balance & Abs`;
        targetFocus = 'Upper & Core';
        focusLabel = 'Upper Body';
        shortFocus = 'Upper Body';

        if (hasDumbbells) {
          addExercise(findEx('sh-1')); // DB Shoulder Press
          addExercise(findEx('fb-7')); // DB Renegade Rows
          addExercise(findEx('ua-4')); // DB Weighted Crunches
        }
        addExercise(findEx('ch-7')); // Diamond Push-Ups
        addExercise(findEx('ob-2')); // Bicycle Crunches
        addExercise(findEx('la-4')); // Dead Bug Holds
        ensureDumbbellMinimum(['sh-1', 'fb-7', 'ua-4', 'bk-1']);
      } else if (cycleDay === 3) {
        title = `Day ${day} · Lower Body & Core`;
        subtitle = `Week ${weekNumber} Quad Drive & Posterior Strength`;
        targetFocus = 'Lower Body';
        focusLabel = 'Lower Body';
        shortFocus = 'Lower Body';

        if (hasDumbbells) {
          addExercise(findEx('fb-6')); // DB Goblet Squats
          addExercise(findEx('ob-6')); // DB Russian Twists
          addExercise(findEx('ob-7')); // DB Side Bends
        }
        addExercise(findEx('fb-2')); // Air Squats
        addExercise(findEx('la-2')); // Flutter Kicks
        addExercise(findEx('la-3')); // Reverse Crunches
        ensureDumbbellMinimum(['fb-6', 'ob-6', 'ob-7', 'ch-1']);
      } else if (cycleDay === 5) {
        title = `Day ${day} · Metabolic Power`;
        subtitle = `Week ${weekNumber} Multi-Joint Conditioning`;
        targetFocus = 'Metabolic Power';
        focusLabel = 'Power';
        shortFocus = 'Power';

        if (hasDumbbells) {
          addExercise(findEx('ch-4')); // Squeeze Press
          addExercise(findEx('bk-1')); // DB Row
          addExercise(findEx('sh-1')); // DB Shoulder Press
        }
        addExercise(findEx('ch-8')); // Wide Push-Ups
        addExercise(findEx('fb-4')); // Mountain Climbers
        addExercise(findEx('ua-1')); // Classic Crunches
        ensureDumbbellMinimum(['ch-4', 'bk-1', 'sh-1', 'fb-6']);
      } else if (cycleDay === 6) {
        title = `Day ${day} · Full Body Fat Burn`;
        subtitle = `Week ${weekNumber} Aerobic Capacity & Calorie Burn`;
        targetFocus = 'Fat Burn';
        focusLabel = 'Fat Burn';
        shortFocus = 'Fat Burn';

        addExercise(findEx('fb-1'));  // Jumping Jacks
        addExercise(findEx('fb-5'));  // Burpees
        addExercise(findEx('fb-4'));  // Mountain Climbers
        addExercise(findEx('fb-14')); // High Knees
        if (hasDumbbells) {
          addExercise(findEx('fb-6')); // DB Goblet Squats
          addExercise(findEx('fb-7')); // DB Renegade Rows
          addExercise(findEx('bk-1')); // DB Row
        }
        ensureDumbbellMinimum(['fb-6', 'fb-7', 'bk-1']);
      }
    }

    // Safety fallback: ensure at least 5 exercises
    if (selectedList.length < 5) {
      for (const ex of eligibleExercises) {
        if (selectedList.length >= 6) break;
        addExercise(ex);
      }
    }

    // Always enforce: If user owns dumbbells, at least 3 dumbbell exercises!
    ensureDumbbellMinimum(['ch-1', 'ch-2', 'ch-4', 'bk-1', 'sh-1', 'fb-6', 'fb-7', 'ua-4', 'ob-6']);

    const duration = calculateDayEstimatedMinutes(selectedList);
    const calories = 160 + weekNumber * 25 + selectedList.length * 8;

    days.push({
      day,
      weekNumber,
      title,
      subtitle,
      targetFocus,
      focusLabel,
      shortFocus,
      durationMinutes: duration,
      estimatedCalories: Math.round(calories),
      isRestDay: false,
      difficultyLevel: dayDifficulty,
      exercises: selectedList,
    });
  }

  return days;
}
