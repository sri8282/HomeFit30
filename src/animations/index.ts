import React from 'react';
import { RiggedExerciseAnimation, RiggedExerciseAnimationProps } from './RiggedExerciseAnimation';

export { ExerciseFigure, calculateJointPositions } from './ExerciseFigure';
export type { ExercisePose, FigurePosture, ExerciseFigureProps, JointPositions } from './ExerciseFigure';

export { RiggedExerciseAnimation } from './RiggedExerciseAnimation';
export type { RiggedExerciseAnimationProps } from './RiggedExerciseAnimation';

export {
  EXERCISE_KEYFRAMES,
  getExerciseKeyframeDef,
  interpolatePose,
  interpolateSequence,
} from './exerciseKeyframes';
export type { ExerciseKeyframeDef } from './exerciseKeyframes';

// Helper to create a dedicated rigged animation component for any exercise ID
export function createRiggedAnimation(exerciseId: string): React.FC<RiggedExerciseAnimationProps> {
  const Comp: React.FC<RiggedExerciseAnimationProps> = (props: RiggedExerciseAnimationProps) => {
    return React.createElement(RiggedExerciseAnimation, { exerciseId, ...props });
  };
  Comp.displayName = `RiggedAnimation_${exerciseId}`;
  return Comp;
}

// ========================================================
// Reusable named animation components for all exercises
// ========================================================

// Chest & Dumbbells
export const DumbbellFloorPressAnimation = createRiggedAnimation('ch-1');
export const DumbbellFlyFloorAnimation = createRiggedAnimation('ch-2');
export const DumbbellPulloverAnimation = createRiggedAnimation('ch-3');
export const SqueezePressAnimation = createRiggedAnimation('ch-4');
export const InclineDumbbellPressAnimation = createRiggedAnimation('ch-5');
export const StandardPushUpsAnimation = createRiggedAnimation('ch-6');
export const DiamondPushUpsAnimation = createRiggedAnimation('ch-7');
export const WidePushUpsAnimation = createRiggedAnimation('ch-8');
export const BenchInclinePushUpsAnimation = createRiggedAnimation('ch-9');
export const DeclinePushUpsAnimation = createRiggedAnimation('ch-11');
export const PushUpBottomIsometricHoldAnimation = createRiggedAnimation('ch-12');

// Back & Shoulders
export const DumbbellRowAnimation = createRiggedAnimation('bk-1');
export const DumbbellShoulderPressAnimation = createRiggedAnimation('sh-1');
export const DumbbellRenegadeRowsAnimation = createRiggedAnimation('fb-7');
export const StrictPullUpsAnimation = createRiggedAnimation('fb-10');

// Full Body & Cardio
export const JumpingJacksAnimation = createRiggedAnimation('fb-1');
export const FullBodyBurpeesAnimation = createRiggedAnimation('fb-5');
export const MountainClimbersAnimation = createRiggedAnimation('fb-4');
export const HighKneesAnimation = createRiggedAnimation('fb-14');
export const DumbbellGobletSquatsAnimation = createRiggedAnimation('fb-6');
export const AirSquatsAnimation = createRiggedAnimation('fb-2');
export const KettlebellSwingsAnimation = createRiggedAnimation('fb-8');
export const SpeedJumpRopeAnimation = createRiggedAnimation('fb-9');
export const BenchStepUpsAnimation = createRiggedAnimation('fb-11');
export const BandThrustersAnimation = createRiggedAnimation('fb-13');

// Upper Abs
export const ClassicCrunchesAnimation = createRiggedAnimation('ua-1');
export const ToeTouchReachAnimation = createRiggedAnimation('ua-2');
export const ButterflyCrunchesAnimation = createRiggedAnimation('ua-3');
export const DumbbellWeightedCrunchesAnimation = createRiggedAnimation('ua-4');
export const BenchAbdominalCrunchesAnimation = createRiggedAnimation('ua-5');
export const BandKneelingCrunchAnimation = createRiggedAnimation('ua-6');
export const KettlebellSitUpPressAnimation = createRiggedAnimation('ua-7');
export const ReverseCrunchToToeReachAnimation = createRiggedAnimation('ua-8');

// Lower Abs
export const LyingLegRaisesAnimation = createRiggedAnimation('la-1');
export const FlutterKicksAnimation = createRiggedAnimation('la-2');
export const ReverseCrunchesAnimation = createRiggedAnimation('la-3');
export const DeadBugHoldsAnimation = createRiggedAnimation('la-4');
export const HollowBodyCompressionAnimation = createRiggedAnimation('la-5');
export const BenchLegPullInsAnimation = createRiggedAnimation('la-6');
export const HangingKneeRaisesAnimation = createRiggedAnimation('la-7');
export const HangingToesToBarAnimation = createRiggedAnimation('la-8');
export const BandLegDriveAnimation = createRiggedAnimation('la-9');

// Obliques
export const RussianTwistsAnimation = createRiggedAnimation('ob-1');
export const BicycleCrunchesAnimation = createRiggedAnimation('ob-2');
export const SidePlankStaticHoldAnimation = createRiggedAnimation('ob-3');
export const HeelTouchesAnimation = createRiggedAnimation('ob-4');
export const SidePlankHipDipsAnimation = createRiggedAnimation('ob-5');
export const DumbbellRussianTwistsAnimation = createRiggedAnimation('ob-6');
export const StandingDumbbellSideBendsAnimation = createRiggedAnimation('ob-7');
export const CrossBodyMountainClimbersAnimation = createRiggedAnimation('ob-8');
export const KettlebellWindmillAnimation = createRiggedAnimation('ob-9');
export const BandWoodchoppersAnimation = createRiggedAnimation('ob-10');
