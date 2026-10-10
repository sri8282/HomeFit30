import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'motion/react';
import { Settings } from 'lucide-react';
import { ExerciseFigure, ExercisePose } from '../animations/ExerciseFigure';
import { interpolateSequence, getExerciseKeyframeDef, EXERCISE_KEYFRAMES } from '../animations/exerciseKeyframes';
import { RiggedExerciseAnimation } from '../animations/RiggedExerciseAnimation';
import {
  UserProfile,
  DayWorkout,
  WorkoutCompletion,
  generateWorkoutPlan,
  getCompletedDays,
  getWorkoutCompletions,
  calculateStreak,
} from '../dataService';
import { InstallButton } from './InstallButton';
import { Confetti } from './Confetti';

// ─── Push-up loop figure (Landing A hero) ────────────────────────────────────
function PushUpFigure({ className }: { className?: string }) {
  const def = getExerciseKeyframeDef('ch-6');
  const keyframes = def.keyframes;
  const progress = useMotionValue(0);
  const [pose, setPose] = useState<ExercisePose>(keyframes[0]);

  useEffect(() => {
    const controls = animate(progress, [0, keyframes.length], {
      duration: 3.2,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'easeInOut',
    });
    const unsub = progress.on('change', (val) => {
      setPose(interpolateSequence(keyframes, val));
    });
    return () => {
      controls.stop();
      unsub();
    };
  }, [keyframes, progress]);

  return (
    <ExerciseFigure
      pose={pose}
      hasDumbbell={false}
      className={className || 'w-full h-full'}
      showFloor={false}
    />
  );
}

// ─── Stretch/breathe figure for rest days ────────────────────────────────────
// Uses 'fb-2' (Air Squats) as a gentle standing motion fallback
function StretchFigure({ className }: { className?: string }) {
  const def = getExerciseKeyframeDef('fb-2');
  const keyframes = def.keyframes;
  const progress = useMotionValue(0);
  const [pose, setPose] = useState<ExercisePose>(keyframes[0]);

  useEffect(() => {
    const controls = animate(progress, [0, keyframes.length], {
      duration: 5.0,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'easeInOut',
    });
    const unsub = progress.on('change', (val) => {
      setPose(interpolateSequence(keyframes, val));
    });
    return () => {
      controls.stop();
      unsub();
    };
  }, [keyframes, progress]);

  return (
    <ExerciseFigure
      pose={pose}
      hasDumbbell={false}
      className={className || 'w-full h-full'}
      showFloor={false}
    />
  );
}

// ─── Floor line — draws outward from centre ───────────────────────────────────
function FloorLine() {
  return (
    <div style={{ position: 'relative', height: 2, width: '100%' }}>
      <div style={{
        position: 'absolute',
        bottom: -2,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '55%',
        height: 20,
        background: 'radial-gradient(ellipse at center bottom, rgba(163,230,53,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <motion.div
        style={{
          position: 'absolute', top: 0, right: '50%', width: '50%', height: 2,
          background: 'linear-gradient(to left, #A3E635 0%, rgba(163,230,53,0) 100%)',
          transformOrigin: 'right center',
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.65, ease: 'easeOut', delay: 0.18 }}
      />
      <motion.div
        style={{
          position: 'absolute', top: 0, left: '50%', width: '50%', height: 2,
          background: 'linear-gradient(to right, #A3E635 0%, rgba(163,230,53,0) 100%)',
          transformOrigin: 'left center',
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.65, ease: 'easeOut', delay: 0.18 }}
      />
    </div>
  );
}

// ─── Masked text line reveal ──────────────────────────────────────────────────
function RevealLine({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <div style={{ overflow: 'hidden' }}>
      <motion.div
        initial={{ y: '110%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.52, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ─── Progress ring ────────────────────────────────────────────────────────────
function ProgressRing({
  completed,
  total,
  size = 64,
  delay = 0.4,
}: {
  completed: number;
  total: number;
  size?: number;
  delay?: number;
}) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(completed / total, 1);
  const [dashOffset, setDashOffset] = useState(circ);

  useEffect(() => {
    const t = setTimeout(() => {
      setDashOffset(circ * (1 - pct));
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [circ, pct, delay]);

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#1E293B" strokeWidth={4} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke="#A3E635" strokeWidth={4} fill="none"
        strokeDasharray={circ}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)' }}
      />
    </svg>
  );
}

// ─── Counting number animation ────────────────────────────────────────────────
function CountUp({ target, duration = 0.6, delay = 0 }: { target: number; duration?: number; delay?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = (ts - start) / 1000;
      if (elapsed < delay) { raf = requestAnimationFrame(step); return; }
      const progress = Math.min((elapsed - delay) / duration, 1);
      setVal(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return <>{String(val).padStart(2, '0')}</>;
}

// ─── Helper: derive today's exercise animation ID ────────────────────────────
function getExerciseAnimId(animationType: string | undefined): string {
  if (!animationType) return 'ch-6';
  // animationType is the exercise id like 'ch-1', 'ua-1', etc.
  // Check if it exists in EXERCISE_KEYFRAMES
  if (EXERCISE_KEYFRAMES[animationType]) return animationType;
  return 'ch-6';
}

// ─── Helper: missed days ──────────────────────────────────────────────────────
function getMissedDays(completions: WorkoutCompletion[]): number {
  if (completions.length === 0) return 0;
  const last = completions.reduce((a, b) =>
    new Date(a.completedAt) > new Date(b.completedAt) ? a : b
  );
  const lastDate = new Date(last.completedAt);
  const now = new Date();
  const diffMs = now.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 2 ? diffDays - 1 : 0; // "missed" = gap > 1 day between last workout and today
}

// ─── Helper: time-of-day greeting ────────────────────────────────────────────
function getGreeting(): 'MORNING' | 'AFTERNOON' | 'EVENING' {
  const h = new Date().getHours();
  if (h < 12) return 'MORNING';
  if (h < 17) return 'AFTERNOON';
  return 'EVENING';
}

// ─── Landing B inner content (loads data) ────────────────────────────────────
interface LandingBProps {
  profile: UserProfile;
  onResume: () => void;
  onOpenDayPreview: (workout: DayWorkout) => void;
  onShowSettings: () => void;
}

function LandingBContent({ profile, onResume, onOpenDayPreview, onShowSettings }: LandingBProps) {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [completions, setCompletions] = useState<WorkoutCompletion[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const confettiFired = useRef(false);

  useEffect(() => {
    Promise.all([getCompletedDays(), getWorkoutCompletions()])
      .then(([days, comps]) => {
        setCompletedDays(days);
        setCompletions(comps);
        setDataLoaded(true);
      })
      .catch(() => setDataLoaded(true));
  }, []);

  // Derive plan
  const workoutPlan = useMemo(() => generateWorkoutPlan(profile), [profile]);

  const currentStreak = calculateStreak(completedDays);
  const totalCompleted = completedDays.length;
  const allDone = totalCompleted >= 30;

  const nextIncompleteDay = workoutPlan.find((d) => !completedDays.includes(d.day))?.day || 1;
  const todayWorkout = workoutPlan.find((d) => d.day === nextIncompleteDay) || workoutPlan[0];
  const isRestDay = todayWorkout?.isRestDay ?? false;

  // Next non-rest day after rest
  const nextWorkoutDay = isRestDay
    ? workoutPlan.find((d) => d.day > todayWorkout.day && !d.isRestDay)
    : null;

  const missedDays = getMissedDays(completions);
  const greeting = getGreeting();

  const firstName = (profile.name?.split(' ')[0] || 'Athlete').toUpperCase();

  // Today's first exercise for the hero figure
  const firstExercise = !isRestDay && todayWorkout?.exercises?.[0];
  const heroAnimId = firstExercise ? getExerciseAnimId(firstExercise.animationType) : 'ch-6';

  // Stats strip for today
  const todayMins = todayWorkout?.durationMinutes ?? 0;
  const todayMoves = todayWorkout?.exercises?.length ?? 0;
  const todayFocus = isRestDay ? 'REST' : (todayWorkout?.shortFocus || todayWorkout?.focusLabel || 'Full Body').toUpperCase();

  const dayNum = todayWorkout?.day ?? 1;
  const dayLabel = allDone ? '30' : String(dayNum).padStart(2, '0');

  return (
    <motion.div
      key="landing-b"
      style={{
        display: 'flex', flexDirection: 'column',
        width: '100%', height: '100dvh',
        paddingTop: 'max(14px, env(safe-area-inset-top, 14px))',
        paddingBottom: 'max(14px, env(safe-area-inset-bottom, 14px))',
        paddingLeft: 20, paddingRight: 20,
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Confetti when all 30 done */}
      {allDone && dataLoaded && !confettiFired.current && (() => { confettiFired.current = true; return <Confetti />; })()}

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', flexShrink: 0, marginBottom: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <motion.span
            style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.28em', color: '#A3E635', textTransform: 'uppercase' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            HOMEFIT 30
          </motion.span>
          <motion.button
            id="landing-settings-btn"
            onClick={onShowSettings}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            whileTap={{ scale: 0.85 }}
          >
            <Settings size={18} color="rgba(255,255,255,0.6)" />
          </motion.button>
        </div>
        <motion.p
          style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', marginTop: 3 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {greeting}, {firstName}
        </motion.p>
      </div>

      {/* ── DAY ROW ── */}
      <motion.div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, marginBottom: 8,
        }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        {/* Left: big DAY label */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginRight: 6 }}>
              {allDone ? 'COMPLETE' : isRestDay ? 'REST DAY' : 'DAY'}
            </span>
            {!isRestDay && !allDone && (
              <span style={{
                fontFamily: "'Archivo Black', 'Outfit', sans-serif",
                fontSize: 52, fontWeight: 900, lineHeight: 1,
                color: '#A3E635', letterSpacing: '-0.03em',
              }}>
                {dataLoaded ? <CountUp target={dayNum} duration={0.6} delay={0.2} /> : '00'}
              </span>
            )}
            {(isRestDay || allDone) && (
              <span style={{
                fontFamily: "'Archivo Black', 'Outfit', sans-serif",
                fontSize: allDone ? 36 : 42, fontWeight: 900, lineHeight: 1,
                color: allDone ? '#A3E635' : 'rgba(255,255,255,0.7)', letterSpacing: '-0.03em',
              }}>
                {allDone ? '30/30 🏆' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Right: progress ring */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ position: 'relative', width: 64, height: 64 }}>
            <ProgressRing completed={totalCompleted} total={30} size={64} delay={0.35} />
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                {dataLoaded ? `${totalCompleted}/30` : '…'}
              </span>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>
            🔥 {currentStreak} day{currentStreak !== 1 ? 's' : ''}
          </span>
        </div>
      </motion.div>

      {/* ── HERO ── */}
      <div style={{
        flex: 1, position: 'relative',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        minHeight: '30%',
        marginLeft: -20, marginRight: -20,
      }}>
        {/* Giant outlined day number watermark */}
        <motion.div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', zIndex: 0,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.0 }}
        >
          <span style={{
            fontFamily: "'Archivo Black', 'Outfit', sans-serif",
            fontSize: 'clamp(180px, 68vw, 260px)',
            fontWeight: 900, lineHeight: 1,
            WebkitTextStroke: '1px rgba(255,255,255,0.06)',
            color: 'transparent',
            userSelect: 'none',
            letterSpacing: '-0.04em',
          }}>
            {allDone ? '🏆' : dayLabel}
          </span>
        </motion.div>

        {/* Figure */}
        <motion.div
          style={{
            position: 'relative', zIndex: 1,
            width: '80%', aspectRatio: '1 / 1',
            marginBottom: -4,
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: 'easeOut' }}
        >
          {isRestDay ? (
            <StretchFigure className="w-full h-full" />
          ) : dataLoaded ? (
            <RiggedExerciseAnimation
              exerciseId={heroAnimId}
              duration={2.8}
              showFloor={false}
              className="w-full h-full"
            />
          ) : (
            <PushUpFigure className="w-full h-full" />
          )}
        </motion.div>

        {/* Floor line */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2 }}>
          <FloorLine />
        </div>
      </div>

      {/* ── TODAY STRIP ── */}
      <motion.div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 0, flexShrink: 0, paddingTop: 10, paddingBottom: 10,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.38, duration: 0.4 }}
      >
        {isRestDay ? (
          <>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' }}>
              REST DAY
            </span>
            {nextWorkoutDay && (
              <>
                <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.15)', margin: '0 12px' }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' }}>
                  NEXT: DAY {nextWorkoutDay.day} · {(nextWorkoutDay.shortFocus || nextWorkoutDay.focusLabel || 'Workout').toUpperCase()}
                </span>
              </>
            )}
          </>
        ) : (
          <>
            {[
              todayFocus,
              `${todayMins} MIN`,
              `${todayMoves} MOVES`,
            ].map((item, i) => (
              <React.Fragment key={item}>
                {i > 0 && (
                  <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.15)', margin: '0 12px', flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {item}
                </span>
              </React.Fragment>
            ))}
          </>
        )}
      </motion.div>

      {/* ── BUTTONS ── */}
      <motion.div
        style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.35 }}
      >
        {/* Missed days notice */}
        {missedDays > 0 && !allDone && (
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 1.5, marginBottom: 10, textAlign: 'center' }}>
            You missed {missedDays} day{missedDays !== 1 ? 's' : ''}. Pick up where you left off.
          </p>
        )}

        {/* Primary CTA */}
        {!allDone ? (
          <button
            id="landing-start-day-btn"
            onClick={() => {
              if (isRestDay) {
                onResume();
              } else {
                onOpenDayPreview(todayWorkout);
              }
            }}
            style={{
              width: '100%', height: 56, borderRadius: 15,
              background: '#A3E635', color: '#0F172A',
              fontWeight: 900, fontSize: 16, fontFamily: 'inherit',
              letterSpacing: '0.01em', border: 'none', cursor: 'pointer',
              position: 'relative', overflow: 'hidden', flexShrink: 0,
              marginBottom: 0,
            }}
          >
            <motion.div
              style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.22), transparent)' }}
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ delay: 1.2, duration: 0.75, ease: 'easeInOut' }}
            />
            {isRestDay ? 'View Full Plan →' : `Start Day ${dayLabel} →`}
          </button>
        ) : (
          <button
            id="landing-new-30-btn"
            onClick={onResume}
            style={{
              width: '100%', height: 56, borderRadius: 15,
              background: '#A3E635', color: '#0F172A',
              fontWeight: 900, fontSize: 16, fontFamily: 'inherit',
              letterSpacing: '0.01em', border: 'none', cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Start a new 30 days 🔄
          </button>
        )}

        {/* View full plan link */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, marginBottom: 10 }}>
          <button
            id="landing-view-plan-btn"
            onClick={onResume}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            View full plan
          </button>
        </div>

        {/* Install button — no gap when hidden */}
        <InstallButton />
      </motion.div>

    </motion.div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface LandingScreenProps {
  sessionState: 'checking' | 'no-session' | 'returning';
  profile: UserProfile | null;
  onGetStarted: () => void;
  onResume: () => void;
  onShowSettings?: () => void;
  onOpenDayPreview?: (workout: DayWorkout) => void;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export const LandingScreen: React.FC<LandingScreenProps> = ({
  sessionState,
  profile,
  onGetStarted,
  onResume,
  onShowSettings,
  onOpenDayPreview,
}) => {
  return (
    <div style={{
      fontFamily: "'Outfit', 'Inter', sans-serif",
      position: 'relative',
      width: '100%',
      height: '100%',
      background: '#0F172A',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ══════════════ SPLASH ══════════════ */}
      <AnimatePresence>
        {sessionState === 'checking' && (
          <motion.div
            key="splash"
            style={{
              position: 'absolute', inset: 0, zIndex: 50, background: '#0F172A',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(163,230,53,0.10)', border: '1px solid rgba(163,230,53,0.30)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg viewBox="0 0 32 32" width="30" height="30" fill="none">
                  <rect x="2" y="13" width="28" height="6" rx="3" fill="#A3E635" />
                  <rect x="0" y="11" width="5" height="10" rx="2.5" fill="#A3E635" />
                  <rect x="27" y="11" width="5" height="10" rx="2.5" fill="#A3E635" />
                  <rect x="5" y="9" width="4" height="14" rx="2" fill="#84CC16" />
                  <rect x="23" y="9" width="4" height="14" rx="2" fill="#84CC16" />
                </svg>
              </div>
              <span style={{ color: '#A3E635', fontWeight: 900, letterSpacing: '0.2em', fontSize: 13, textTransform: 'uppercase' }}>
                HOMEFIT 30
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════ LANDING A — NEW USER ══════════════ */}
      <AnimatePresence>
        {sessionState === 'no-session' && (
          <motion.div
            key="landing-a"
            style={{
              display: 'flex', flexDirection: 'column',
              width: '100%', height: '100dvh',
              paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
              paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
              paddingLeft: 20, paddingRight: 20,
              boxSizing: 'border-box',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0, marginBottom: 8,
            }}>
              <motion.span
                style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.28em', color: '#A3E635', textTransform: 'uppercase' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05, duration: 0.4 }}
              >
                HOMEFIT 30
              </motion.span>
              <motion.button
                id="landing-login-btn"
                onClick={onGetStarted}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', padding: '4px 0' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05, duration: 0.4 }}
                whileTap={{ opacity: 0.5 }}
              >
                Log in
              </motion.button>
            </div>

            {/* Hero */}
            <div style={{
              flex: 1, position: 'relative',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              minHeight: '40%', marginLeft: -20, marginRight: -20,
            }}>
              <motion.div
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.0 }}
              >
                <span style={{
                  fontFamily: "'Archivo Black', 'Outfit', sans-serif",
                  fontSize: 'clamp(200px, 72vw, 300px)',
                  fontWeight: 900, lineHeight: 1,
                  WebkitTextStroke: '1px rgba(255,255,255,0.06)',
                  color: 'transparent', userSelect: 'none', letterSpacing: '-0.04em',
                }}>
                  30
                </span>
              </motion.div>
              <motion.div
                style={{ position: 'relative', zIndex: 1, width: '85%', aspectRatio: '1 / 1', marginBottom: -4 }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
              >
                <PushUpFigure className="w-full h-full" />
              </motion.div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2 }}>
                <FloorLine />
              </div>
            </div>

            {/* Stats strip */}
            <motion.div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, paddingTop: 12, paddingBottom: 12 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              {[{ label: '30 DAYS' }, { label: '15–25 MIN' }, { label: 'AT HOME' }].map((item, i) => (
                <React.Fragment key={item.label}>
                  {i > 0 && <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.15)', marginLeft: 14, marginRight: 14, flexShrink: 0 }} />}
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                </React.Fragment>
              ))}
            </motion.div>

            {/* Headline */}
            <div style={{ flexShrink: 0, marginBottom: 16 }}>
              <RevealLine delay={0.45}>
                <span style={{ fontSize: 'clamp(30px, 9.5vw, 40px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.025em', display: 'block' }}>30 DAYS.</span>
              </RevealLine>
              <RevealLine delay={0.53}>
                <span style={{ fontSize: 'clamp(30px, 9.5vw, 40px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.025em', display: 'block' }}>YOUR FLOOR.</span>
              </RevealLine>
              <RevealLine delay={0.61}>
                <span style={{ fontSize: 'clamp(30px, 9.5vw, 40px)', fontWeight: 900, color: '#A3E635', lineHeight: 1.05, letterSpacing: '-0.025em', display: 'block' }}>YOUR DUMBBELLS.</span>
              </RevealLine>
              <motion.p
                style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.55, marginTop: 8, marginBottom: 0 }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.78, duration: 0.4 }}
              >
                A plan built around what you actually own.
              </motion.p>
            </div>

            {/* Buttons */}
            <motion.div
              style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.35 }}
            >
              <button
                id="landing-get-started-btn"
                onClick={onGetStarted}
                style={{
                  width: '100%', height: 56, borderRadius: 15,
                  background: '#A3E635', color: '#0F172A',
                  fontWeight: 900, fontSize: 16, fontFamily: 'inherit',
                  letterSpacing: '0.01em', border: 'none', cursor: 'pointer',
                  position: 'relative', overflow: 'hidden', flexShrink: 0,
                }}
              >
                <motion.div
                  style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.22), transparent)' }}
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ delay: 1.6, duration: 0.75, ease: 'easeInOut' }}
                />
                Start Your 30 Days →
              </button>
              <InstallButton />
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════ LANDING B — RETURNING USER ══════════════ */}
      <AnimatePresence>
        {sessionState === 'returning' && profile && (
          <LandingBContent
            key="landing-b"
            profile={profile}
            onResume={onResume}
            onOpenDayPreview={onOpenDayPreview ?? (() => onResume())}
            onShowSettings={onShowSettings ?? onResume}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
