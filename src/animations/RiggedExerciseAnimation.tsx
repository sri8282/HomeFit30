import React, { useState, useEffect, useMemo } from 'react';
import { animate, useMotionValue } from 'motion/react';
import { ExerciseFigure, ExercisePose } from './ExerciseFigure';
import { getExerciseKeyframeDef, interpolateSequence } from './exerciseKeyframes';

export interface RiggedExerciseAnimationProps {
  exerciseId?: string;
  customKeyframes?: ExercisePose[];
  duration?: number;
  hasDumbbell?: boolean;
  className?: string;
  showFloor?: boolean;
}

export const RiggedExerciseAnimation: React.FC<RiggedExerciseAnimationProps> = ({
  exerciseId = 'ch-6',
  customKeyframes,
  duration,
  hasDumbbell,
  className = 'w-full h-full',
  showFloor = true,
}) => {
  const def = useMemo(() => getExerciseKeyframeDef(exerciseId), [exerciseId]);
  const keyframes = customKeyframes || def.keyframes;
  const repDuration = duration || def.duration || 2.0;
  const dumbbellEnabled = hasDumbbell !== undefined ? hasDumbbell : def.hasDumbbell;

  const numSegments = keyframes.length;
  const progress = useMotionValue(0);
  const [currentPose, setCurrentPose] = useState<ExercisePose>(() => keyframes[0]);

  useEffect(() => {
    // Reset initial pose when exercise changes
    setCurrentPose(keyframes[0]);
    progress.set(0);

    // Animate across keyframe sequence smoothly with Framer Motion (~2s per rep)
    const controls = animate(progress, [0, numSegments], {
      duration: repDuration,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'easeInOut',
    });

    const unsubscribe = progress.on('change', (val) => {
      const interpolated = interpolateSequence(keyframes, val);
      setCurrentPose(interpolated);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [keyframes, repDuration, numSegments, progress]);

  return (
    <ExerciseFigure
      pose={currentPose}
      hasDumbbell={dumbbellEnabled}
      className={className}
      showFloor={showFloor}
    />
  );
};
