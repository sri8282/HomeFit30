import React from 'react';

export type FigurePosture = 'standing' | 'lying_back' | 'lying_face_down' | 'plank';

export interface ExercisePose {
  posture?: FigurePosture;
  hipX?: number;
  hipY?: number;
  torsoAngle: number;
  neckAngle?: number;

  leftShoulderAngle: number;
  leftElbowAngle: number;
  rightShoulderAngle?: number;
  rightElbowAngle?: number;

  leftHipAngle: number;
  leftKneeAngle: number;
  rightHipAngle?: number;
  rightKneeAngle?: number;

  hasDumbbell?: boolean;
}

export interface JointPositions {
  hip: { x: number; y: number };
  shoulder: { x: number; y: number };
  neck: { x: number; y: number };
  head: { x: number; y: number };

  leftElbow: { x: number; y: number };
  leftWrist: { x: number; y: number };
  rightElbow: { x: number; y: number };
  rightWrist: { x: number; y: number };

  leftKnee: { x: number; y: number };
  leftAnkle: { x: number; y: number };
  rightKnee: { x: number; y: number };
  rightAnkle: { x: number; y: number };
}

const L_TORSO = 40;
const L_NECK = 8;
const R_HEAD = 9;
const L_UPPER_ARM = 21;
const L_FOREARM = 19;
const L_THIGH = 25;
const L_SHIN = 25;

const toRad = (deg: number) => (deg * Math.PI) / 180;

export function calculateJointPositions(pose: ExercisePose): JointPositions {
  const posture = pose.posture || 'standing';

  // Base root position defaults per posture
  let defaultHipX = 100;
  let defaultHipY = 115;

  if (posture === 'lying_back') {
    defaultHipX = 80;
    defaultHipY = 160;
  } else if (posture === 'plank') {
    defaultHipX = 85;
    defaultHipY = 130;
  } else if (posture === 'lying_face_down') {
    defaultHipX = 85;
    defaultHipY = 164;
  }

  const hipX = pose.hipX !== undefined ? pose.hipX : defaultHipX;
  const hipY = pose.hipY !== undefined ? pose.hipY : defaultHipY;
  const hip = { x: hipX, y: hipY };

  // Torso
  const torsoAngle = pose.torsoAngle;
  const neckAngle = pose.neckAngle || 0;

  const shoulderX = hipX + L_TORSO * Math.cos(toRad(torsoAngle));
  const shoulderY = hipY + L_TORSO * Math.sin(toRad(torsoAngle));
  const shoulder = { x: shoulderX, y: shoulderY };

  const neckX = shoulderX + L_NECK * Math.cos(toRad(torsoAngle + neckAngle));
  const neckY = shoulderY + L_NECK * Math.sin(toRad(torsoAngle + neckAngle));
  const neck = { x: neckX, y: neckY };

  const headX = shoulderX + (L_NECK + R_HEAD + 2) * Math.cos(toRad(torsoAngle + neckAngle));
  const headY = shoulderY + (L_NECK + R_HEAD + 2) * Math.sin(toRad(torsoAngle + neckAngle));
  const head = { x: headX, y: headY };

  // Arms (angles are in degrees)
  const lShoulder = pose.leftShoulderAngle;
  const lElbow = pose.leftElbowAngle;
  const rShoulder = pose.rightShoulderAngle !== undefined ? pose.rightShoulderAngle : lShoulder;
  const rElbow = pose.rightElbowAngle !== undefined ? pose.rightElbowAngle : lElbow;

  // Left arm (foreground)
  const leftElbowX = shoulderX + L_UPPER_ARM * Math.cos(toRad(lShoulder));
  const leftElbowY = shoulderY + L_UPPER_ARM * Math.sin(toRad(lShoulder));
  const leftElbow = { x: leftElbowX, y: leftElbowY };

  const leftWristX = leftElbowX + L_FOREARM * Math.cos(toRad(lElbow));
  const leftWristY = leftElbowY + L_FOREARM * Math.sin(toRad(lElbow));
  const leftWrist = { x: leftWristX, y: leftWristY };

  // Right arm (background depth - offset slightly if symmetric for 3D visibility)
  const isArmSymmetric = rShoulder === lShoulder && rElbow === lElbow;
  const rArmOffsetX = isArmSymmetric ? -3 : 0;
  const rArmOffsetY = isArmSymmetric ? -2 : 0;

  const rightElbowX = shoulderX + rArmOffsetX + L_UPPER_ARM * Math.cos(toRad(rShoulder));
  const rightElbowY = shoulderY + rArmOffsetY + L_UPPER_ARM * Math.sin(toRad(rShoulder));
  const rightElbow = { x: rightElbowX, y: rightElbowY };

  const rightWristX = rightElbowX + L_FOREARM * Math.cos(toRad(rElbow));
  const rightWristY = rightElbowY + L_FOREARM * Math.sin(toRad(rElbow));
  const rightWrist = { x: rightWristX, y: rightWristY };

  // Legs
  const lHip = pose.leftHipAngle;
  const lKnee = pose.leftKneeAngle;
  const rHip = pose.rightHipAngle !== undefined ? pose.rightHipAngle : lHip;
  const rKnee = pose.rightKneeAngle !== undefined ? pose.rightKneeAngle : lKnee;

  // Left leg (foreground)
  const leftKneeX = hipX + L_THIGH * Math.cos(toRad(lHip));
  const leftKneeY = hipY + L_THIGH * Math.sin(toRad(lHip));
  const leftKnee = { x: leftKneeX, y: leftKneeY };

  const leftAnkleX = leftKneeX + L_SHIN * Math.cos(toRad(lKnee));
  const leftAnkleY = leftKneeY + L_SHIN * Math.sin(toRad(lKnee));
  const leftAnkle = { x: leftAnkleX, y: leftAnkleY };

  // Right leg (background depth - offset slightly if symmetric)
  const isLegSymmetric = rHip === lHip && rKnee === lKnee;
  const rLegOffsetX = isLegSymmetric ? -4 : 0;
  const rLegOffsetY = isLegSymmetric ? -2 : 0;

  const rightKneeX = hipX + rLegOffsetX + L_THIGH * Math.cos(toRad(rHip));
  const rightKneeY = hipY + rLegOffsetY + L_THIGH * Math.sin(toRad(rHip));
  const rightKnee = { x: rightKneeX, y: rightKneeY };

  const rightAnkleX = rightKneeX + L_SHIN * Math.cos(toRad(rKnee));
  const rightAnkleY = rightKneeY + L_SHIN * Math.sin(toRad(rKnee));
  const rightAnkle = { x: rightAnkleX, y: rightAnkleY };

  return {
    hip,
    shoulder,
    neck,
    head,
    leftElbow,
    leftWrist,
    rightElbow,
    rightWrist,
    leftKnee,
    leftAnkle,
    rightKnee,
    rightAnkle,
  };
}

export interface ExerciseFigureProps {
  pose: ExercisePose;
  hasDumbbell?: boolean;
  className?: string;
  showFloor?: boolean;
}

export const ExerciseFigure: React.FC<ExerciseFigureProps> = ({
  pose,
  hasDumbbell = pose.hasDumbbell,
  className = 'w-full h-full',
  showFloor = true,
}) => {
  const joints = calculateJointPositions(pose);

  // Lime green styling with thick rounded limbs
  const limbStrokeForeground = '#A3E635'; // Lime green
  const limbStrokeBackground = '#65A30D'; // Deeper olive/lime for 3D depth
  const limbStrokeWidth = 7.5;
  const torsoStrokeWidth = 9;

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft neon floor glow */}
        <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#334155" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#A3E635" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#334155" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Dark background */}
      <rect width="200" height="200" fill="#090D16" rx="16" />

      {/* Floor line */}
      {showFloor && (
        <g>
          <line
            x1="18"
            y1="175"
            x2="182"
            y2="175"
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <line
            x1="32"
            y1="175"
            x2="168"
            y2="175"
            stroke="url(#floorGrad)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* === BACKGROUND LAYER (Right Arm & Right Leg for 2.5D Depth) === */}
      {/* Right Leg */}
      <line
        x1={joints.hip.x}
        y1={joints.hip.y}
        x2={joints.rightKnee.x}
        y2={joints.rightKnee.y}
        stroke={limbStrokeBackground}
        strokeWidth={limbStrokeWidth}
        strokeLinecap="round"
      />
      <line
        x1={joints.rightKnee.x}
        y1={joints.rightKnee.y}
        x2={joints.rightAnkle.x}
        y2={joints.rightAnkle.y}
        stroke={limbStrokeBackground}
        strokeWidth={limbStrokeWidth}
        strokeLinecap="round"
      />
      {/* Right Foot mini-accent */}
      <circle cx={joints.rightAnkle.x} cy={joints.rightAnkle.y} r={4} fill={limbStrokeBackground} />

      {/* Right Arm */}
      <line
        x1={joints.shoulder.x}
        y1={joints.shoulder.y}
        x2={joints.rightElbow.x}
        y2={joints.rightElbow.y}
        stroke={limbStrokeBackground}
        strokeWidth={limbStrokeWidth}
        strokeLinecap="round"
      />
      <line
        x1={joints.rightElbow.x}
        y1={joints.rightElbow.y}
        x2={joints.rightWrist.x}
        y2={joints.rightWrist.y}
        stroke={limbStrokeBackground}
        strokeWidth={limbStrokeWidth}
        strokeLinecap="round"
      />

      {/* Right Hand Dumbbell */}
      {hasDumbbell && (
        <g transform={`translate(${joints.rightWrist.x}, ${joints.rightWrist.y})`}>
          <line x1="-7" y1="0" x2="7" y2="0" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="-9.5" y="-5" width="3" height="10" rx="1" fill="#64748B" />
          <rect x="6.5" y="-5" width="3" height="10" rx="1" fill="#64748B" />
        </g>
      )}

      {/* === CORE LAYER (Torso, Neck, Head) === */}
      {/* Torso from hips to shoulders */}
      <line
        x1={joints.hip.x}
        y1={joints.hip.y}
        x2={joints.shoulder.x}
        y2={joints.shoulder.y}
        stroke={limbStrokeForeground}
        strokeWidth={torsoStrokeWidth}
        strokeLinecap="round"
      />

      {/* Neck */}
      <line
        x1={joints.shoulder.x}
        y1={joints.shoulder.y}
        x2={joints.neck.x}
        y2={joints.neck.y}
        stroke={limbStrokeForeground}
        strokeWidth={limbStrokeWidth}
        strokeLinecap="round"
      />

      {/* Head */}
      <circle cx={joints.head.x} cy={joints.head.y} r={R_HEAD} fill={limbStrokeForeground} />

      {/* Hip joint circle */}
      <circle cx={joints.hip.x} cy={joints.hip.y} r={5} fill={limbStrokeForeground} />

      {/* Shoulder joint circle */}
      <circle cx={joints.shoulder.x} cy={joints.shoulder.y} r={5} fill={limbStrokeForeground} />

      {/* === FOREGROUND LAYER (Left Leg & Left Arm) === */}
      {/* Left Leg */}
      <line
        x1={joints.hip.x}
        y1={joints.hip.y}
        x2={joints.leftKnee.x}
        y2={joints.leftKnee.y}
        stroke={limbStrokeForeground}
        strokeWidth={limbStrokeWidth}
        strokeLinecap="round"
      />
      <line
        x1={joints.leftKnee.x}
        y1={joints.leftKnee.y}
        x2={joints.leftAnkle.x}
        y2={joints.leftAnkle.y}
        stroke={limbStrokeForeground}
        strokeWidth={limbStrokeWidth}
        strokeLinecap="round"
      />
      {/* Left Foot mini-accent */}
      <circle cx={joints.leftAnkle.x} cy={joints.leftAnkle.y} r={4.2} fill={limbStrokeForeground} />

      {/* Left Arm */}
      <line
        x1={joints.shoulder.x}
        y1={joints.shoulder.y}
        x2={joints.leftElbow.x}
        y2={joints.leftElbow.y}
        stroke={limbStrokeForeground}
        strokeWidth={limbStrokeWidth}
        strokeLinecap="round"
      />
      <line
        x1={joints.leftElbow.x}
        y1={joints.leftElbow.y}
        x2={joints.leftWrist.x}
        y2={joints.leftWrist.y}
        stroke={limbStrokeForeground}
        strokeWidth={limbStrokeWidth}
        strokeLinecap="round"
      />

      {/* Left Hand Dumbbell */}
      {hasDumbbell && (
        <g transform={`translate(${joints.leftWrist.x}, ${joints.leftWrist.y})`}>
          <line x1="-8" y1="0" x2="8" y2="0" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
          <rect x="-11" y="-6" width="3.5" height="12" rx="1.2" fill="#E2E8F0" />
          <rect x="7.5" y="-6" width="3.5" height="12" rx="1.2" fill="#E2E8F0" />
        </g>
      )}
    </svg>
  );
};
