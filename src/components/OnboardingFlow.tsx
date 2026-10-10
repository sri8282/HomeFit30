import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  ChevronRight,
  User,
  Shield,
  Flame,
  Zap,
} from 'lucide-react';
import {
  Gender,
  Goal,
  Equipment,
  FocusArea,
  UserProfile,
  saveUserProfile,
  setOnboardingCompleted,
  calculateBMI,
  getErrorMessage,
} from '../dataService';
import { ScrollPicker } from './ScrollPicker';
import { soundManager } from '../soundService';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>('male');

  // Step 3 metrics
  const [age, setAge] = useState<number>(26);
  const [height, setHeight] = useState<number>(175);
  const [weight, setWeight] = useState<number>(72);
  const [activeMetricTab, setActiveMetricTab] = useState<'age' | 'height' | 'weight'>('age');

  // Step 4 goal
  const [goal, setGoal] = useState<Goal>('lose_belly_fat');

  // Step 5 focus area (Default: Chest)
  const [focusArea, setFocusArea] = useState<FocusArea>('chest');

  // Step 6 equipment
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>(['none']);

  // Step 7 plan generation animation
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [loadingStatusIndex, setLoadingStatusIndex] = useState<number>(0);

  const totalSteps = 7;

  // Equipment options configuration with exact fixed IDs
  const equipmentOptions: { id: Equipment; name: string; description: string; icon: string }[] = [
    { id: 'none', name: 'None (Bodyweight)', description: 'Zero equipment bodyweight only', icon: '🏃' },
    { id: 'dumbbell', name: 'Dumbbells', description: 'Adjustable or hex pairs (at least 3 moves per workout)', icon: '🏋️' },
    { id: 'pullup_bar', name: 'Pull-up bar', description: 'Doorway or wall mounted', icon: '🧗' },
    { id: 'bench', name: 'Bench', description: 'Flat or incline workout bench', icon: '🛋️' },
    { id: 'band', name: 'Resistance bands', description: 'Loop or handle tubes', icon: '🎗️' },
    { id: 'kettlebell', name: 'Kettlebell', description: 'Ballistic power & swings', icon: '⚡' },
    { id: 'jump_rope', name: 'Jump rope', description: 'High tempo cardio burner', icon: '🪢' },
  ];

  const focusOptions: { id: FocusArea; title: string; subtitle: string; icon: string; tag: string }[] = [
    {
      id: 'chest',
      title: 'Chest',
      subtitle: 'Pectoral mass, push-up mastery & heavy pressing power (7-day split)',
      icon: '🛡️',
      tag: 'Default & Popular',
    },
    {
      id: 'abs',
      title: 'Abs',
      subtitle: 'Core definition, six-pack sculpting & tight oblique compression',
      icon: '⚡',
      tag: 'Core Matrix',
    },
    {
      id: 'full_body',
      title: 'Full body',
      subtitle: 'Total body conditioning, metabolic fat burn & functional power',
      icon: '🔥',
      tag: 'Metabolic Power',
    },
  ];

  const goalOptions: { id: Goal; title: string; subtitle: string; tag: string; icon: string }[] = [
    {
      id: 'lose_belly_fat',
      title: 'Lose belly fat',
      subtitle: 'High-intensity calorie furnace & visceral fat targeting',
      tag: 'Metabolic Burn',
      icon: '🔥',
    },
    {
      id: 'build_abs',
      title: 'Build abs',
      subtitle: 'Carve defined six-pack, obliques & tight core compression',
      tag: 'Core Definition',
      icon: '⚡',
    },
    {
      id: 'get_stronger',
      title: 'Get stronger',
      subtitle: 'Compound power, functional strength & muscular stamina',
      tag: 'Strength & Density',
      icon: '💪',
    },
  ];

  const loadingSteps = [
    'Analyzing body metrics & metabolic rate...',
    'Calibrating 30-day progressive overload...',
    'Matching exercises to your equipment & focus...',
    'Generating Day 1 personalized routine...',
  ];

  // Equipment toggle handler
  const toggleEquipment = (eqId: Equipment) => {
    if (eqId === 'none') {
      setSelectedEquipment(['none']);
      return;
    }

    const withoutNone = selectedEquipment.filter((item) => item !== 'none');
    if (withoutNone.includes(eqId)) {
      const remaining = withoutNone.filter((item) => item !== eqId);
      setSelectedEquipment(remaining.length === 0 ? ['none'] : remaining);
    } else {
      setSelectedEquipment([...withoutNone, eqId]);
    }
  };

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleExecuteSave = async () => {
    setSaveError(null);
    const finalProfile: Partial<UserProfile> = {
      name: name.trim() || 'Athlete',
      gender,
      age,
      height,
      weight,
      goal,
      focusArea,
      equipment: selectedEquipment,
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
    };

    try {
      await saveUserProfile(finalProfile);
      await setOnboardingCompleted(true);
      soundManager.playSuccessChime();

      setTimeout(() => {
        onComplete();
      }, 300);
    } catch (err) {
      setSaveError(getErrorMessage(err));
    }
  };

  // Step 7: 2-second plan creation animation
  useEffect(() => {
    if (step !== 7) return;

    soundManager.playBeep(600, 150);

    const startTime = Date.now();
    const duration = 2000; // 2 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgressPercent(progress);

      const statusIdx = Math.min(
        loadingSteps.length - 1,
        Math.floor((elapsed / duration) * loadingSteps.length)
      );
      setLoadingStatusIndex(statusIdx);

      if (elapsed >= duration) {
        clearInterval(interval);
        handleExecuteSave();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [step]);

  const bmiInfo = calculateBMI(height, weight);

  const nextStep = () => {
    if (step < 7) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between bg-[#0F172A] text-white p-5 relative overflow-y-auto no-scrollbar">
      {/* Top Navigation Bar / Progress Indicator (Steps 2 - 6) */}
      {step >= 2 && step <= 6 && (
        <div className="w-full flex items-center justify-between pt-2 pb-4">
          <button
            type="button"
            onClick={prevStep}
            className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700/50 active:scale-95 transition-all cursor-pointer"
            aria-label="Previous step"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Segmented step track */}
          <div className="flex-1 mx-4 flex items-center gap-1.5">
            {[2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-[#A3E635]' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>

          <span className="text-xs font-mono font-bold text-slate-400">
            {step}/{totalSteps - 1}
          </span>
        </div>
      )}

      {/* Main Form Screens */}
      <AnimatePresence mode="wait">
        {/* ================= STEP 1: USER'S NAME ================= */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col justify-between py-6"
          >
            <div>
              <span className="text-xs font-bold text-[#A3E635] tracking-wider uppercase">Welcome</span>
              <h1 className="text-3xl font-black text-white mt-1 font-display tracking-tight">
                What's your name?
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                We'll personalize your daily 30-day coaching journey.
              </p>

              <div className="mt-8 space-y-3">
                <label htmlFor="user-name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Your First Name
                </label>
                <div className="relative">
                  <input
                    id="user-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (!name.trim()) {
                          setNameError('Please enter your name to continue');
                        } else {
                          nextStep();
                        }
                      }
                    }}
                    placeholder="e.g. Alex"
                    autoFocus
                    className="w-full h-14 px-4 pl-12 rounded-2xl bg-slate-900 border-2 border-slate-700/80 focus:border-[#A3E635] focus:outline-none text-white text-base font-semibold placeholder:text-slate-600 transition-colors"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <User className="w-5 h-5 text-[#A3E635]" />
                  </div>
                </div>
                {nameError && (
                  <p className="text-xs font-semibold text-rose-400 mt-1 pl-1">
                    {nameError}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => {
                  if (!name.trim()) {
                    setNameError('Please enter your name to continue');
                  } else {
                    nextStep();
                  }
                }}
                className="w-full h-14 rounded-2xl bg-[#A3E635] hover:bg-[#b0f242] active:scale-[0.98] text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(163,230,53,0.3)] transition-all cursor-pointer font-display"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 2: GENDER ================= */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col justify-between py-2"
          >
            <div>
              <span className="text-xs font-bold text-[#A3E635] tracking-wider uppercase">Step 1</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">
                Select your gender
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Calibrates basal metabolic rate and muscular adaptation curves.
              </p>

              <div className="mt-8 space-y-4">
                {/* Male Card */}
                <div
                  onClick={() => setGender('male')}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    gender === 'male'
                      ? 'bg-slate-800/90 border-[#A3E635] shadow-[0_0_20px_rgba(163,230,53,0.25)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                      gender === 'male' ? 'bg-[#A3E635] text-slate-950' : 'bg-slate-800'
                    }`}>
                      👨
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-display">Male</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Metabolic burn tailored to male physiology</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    gender === 'male' ? 'border-[#A3E635] bg-[#A3E635] text-slate-950' : 'border-slate-600'
                  }`}>
                    {gender === 'male' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                {/* Female Card */}
                <div
                  onClick={() => setGender('female')}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    gender === 'female'
                      ? 'bg-slate-800/90 border-[#A3E635] shadow-[0_0_20px_rgba(163,230,53,0.25)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                      gender === 'female' ? 'bg-[#A3E635] text-slate-950' : 'bg-slate-800'
                    }`}>
                      👩
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-display">Female</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Metabolic burn tailored to female physiology</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    gender === 'female' ? 'border-[#A3E635] bg-[#A3E635] text-slate-950' : 'border-slate-600'
                  }`}>
                    {gender === 'female' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={nextStep}
                className="w-full h-14 rounded-2xl bg-[#A3E635] hover:bg-[#b0f242] active:scale-[0.98] text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(163,230,53,0.3)] transition-all cursor-pointer font-display"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 3: AGE, HEIGHT & WEIGHT ================= */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col justify-between py-2"
          >
            <div>
              <span className="text-xs font-bold text-[#A3E635] tracking-wider uppercase">Step 2</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">
                Your body metrics
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Used to calculate BMI, resting energy expenditure, and overload stages.
              </p>

              {/* Sub-tabs for Age, Height, Weight */}
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 mt-5">
                <button
                  type="button"
                  onClick={() => setActiveMetricTab('age')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center ${
                    activeMetricTab === 'age'
                      ? 'bg-[#A3E635] text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="uppercase text-[10px]">Age</span>
                  <span className="text-base font-black font-mono">{age}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMetricTab('height')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center ${
                    activeMetricTab === 'height'
                      ? 'bg-[#A3E635] text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="uppercase text-[10px]">Height</span>
                  <span className="text-base font-black font-mono">{height} cm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMetricTab('weight')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center ${
                    activeMetricTab === 'weight'
                      ? 'bg-[#A3E635] text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="uppercase text-[10px]">Weight</span>
                  <span className="text-base font-black font-mono">{weight} kg</span>
                </button>
              </div>

              {/* Smooth Vertical Scroll Pickers */}
              <div className="mt-4 flex flex-col items-center justify-center">
                {activeMetricTab === 'age' && (
                  <ScrollPicker
                    min={13}
                    max={80}
                    value={age}
                    unit="years old"
                    onChange={(val) => setAge(val)}
                  />
                )}

                {activeMetricTab === 'height' && (
                  <ScrollPicker
                    min={120}
                    max={220}
                    value={height}
                    unit="cm"
                    onChange={(val) => setHeight(val)}
                  />
                )}

                {activeMetricTab === 'weight' && (
                  <ScrollPicker
                    min={30}
                    max={200}
                    value={weight}
                    unit="kg"
                    onChange={(val) => setWeight(val)}
                  />
                )}
              </div>

              {/* Dynamic Live BMI Insight Card */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Calculated BMI
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-lg font-black text-white font-mono">{bmiInfo.bmi}</span>
                    <span className="text-xs font-semibold text-[#A3E635]">{bmiInfo.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Pacing Tier</span>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">
                    {bmiInfo.bmi > 27 || age > 45 ? 'Joint-safe progressive' : 'Athletic overload'}
                  </p>
                </div>
              </div>
            </div>

            {/* Metric Continue button */}
            <div className="pt-4">
              {activeMetricTab !== 'weight' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeMetricTab === 'age') setActiveMetricTab('height');
                    else if (activeMetricTab === 'height') setActiveMetricTab('weight');
                  }}
                  className="w-full h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer font-display"
                >
                  <span>Next Metric ({activeMetricTab === 'age' ? 'Height' : 'Weight'})</span>
                  <ChevronRight className="w-4 h-4 text-[#A3E635]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full h-14 rounded-2xl bg-[#A3E635] hover:bg-[#b0f242] active:scale-[0.98] text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(163,230,53,0.3)] transition-all cursor-pointer font-display"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ================= STEP 4: GOAL ================= */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col justify-between py-2"
          >
            <div>
              <span className="text-xs font-bold text-[#A3E635] tracking-wider uppercase">Step 3</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">
                What is your main goal?
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                We will program exercise volume and tempo around this target.
              </p>

              <div className="mt-6 space-y-3.5">
                {goalOptions.map((opt) => {
                  const isSelected = goal === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setGoal(opt.id)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-800/95 border-[#A3E635] shadow-[0_0_20px_rgba(163,230,53,0.25)]'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                            isSelected ? 'bg-[#A3E635] text-slate-950' : 'bg-slate-800'
                          }`}
                        >
                          {opt.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-white font-display">
                              {opt.title}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-snug">
                            {opt.subtitle}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 shrink-0 ml-2 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-[#A3E635] bg-[#A3E635] text-slate-950'
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

            <div className="pt-6">
              <button
                type="button"
                onClick={nextStep}
                className="w-full h-14 rounded-2xl bg-[#A3E635] hover:bg-[#b0f242] active:scale-[0.98] text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(163,230,53,0.3)] transition-all cursor-pointer font-display"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 5: FOCUS AREA ================= */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col justify-between py-2"
          >
            <div>
              <span className="text-xs font-bold text-[#A3E635] tracking-wider uppercase">Step 4</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">
                Select your focus area
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Your 30-day program will structure its daily splits and weekly themes around this focus.
              </p>

              <div className="mt-6 space-y-3.5">
                {focusOptions.map((opt) => {
                  const isSelected = focusArea === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setFocusArea(opt.id)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-800/95 border-[#A3E635] shadow-[0_0_20px_rgba(163,230,53,0.25)]'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                            isSelected ? 'bg-[#A3E635] text-slate-950' : 'bg-slate-800'
                          }`}
                        >
                          {opt.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-white font-display">
                              {opt.title}
                            </h3>
                            {opt.id === 'chest' && (
                              <span className="text-[10px] font-extrabold uppercase tracking-wide bg-[#A3E635]/20 text-[#A3E635] px-2 py-0.5 rounded-full border border-[#A3E635]/30">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-snug">
                            {opt.subtitle}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 shrink-0 ml-2 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-[#A3E635] bg-[#A3E635] text-slate-950'
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

            <div className="pt-6">
              <button
                type="button"
                onClick={nextStep}
                className="w-full h-14 rounded-2xl bg-[#A3E635] hover:bg-[#b0f242] active:scale-[0.98] text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(163,230,53,0.3)] transition-all cursor-pointer font-display"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 6: EQUIPMENT (MULTI-SELECT) ================= */}
        {step === 6 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col justify-between py-2"
          >
            <div>
              <span className="text-xs font-bold text-[#A3E635] tracking-wider uppercase">Step 5</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">
                What equipment do you have?
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Tap all that apply. Select <span className="text-[#A3E635] font-semibold">None</span> for bodyweight only.
              </p>

              {/* Equipment Cards List */}
              <div className="mt-5 space-y-2.5 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
                {equipmentOptions.map((item) => {
                  const isSelected = selectedEquipment.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleEquipment(item.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-800 border-[#A3E635] shadow-[0_0_15px_rgba(163,230,53,0.2)]'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                            isSelected ? 'bg-[#A3E635]/20 text-white' : 'bg-slate-800/80 text-slate-300'
                          }`}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white font-display">{item.name}</h4>
                          <p className="text-[11px] text-slate-400 leading-tight">{item.description}</p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#A3E635] border-[#A3E635] text-slate-950'
                            : 'border-slate-600 bg-slate-800'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Create My Plan Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={nextStep}
                className="w-full h-14 rounded-2xl bg-[#A3E635] hover:bg-[#b0f242] active:scale-[0.98] text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(163,230,53,0.35)] transition-all cursor-pointer font-display"
              >
                <Sparkles className="w-5 h-5" />
                <span>Create My 30-Day Plan</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 7: 2-SECOND CREATING YOUR PLAN ANIMATION ================= */}
        {step === 7 && (
          <motion.div
            key="step7"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center py-8 text-center"
          >
            {/* Animated Circular Progress Gauge */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-8">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-[#A3E635] transition-all duration-100 ease-out"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white font-display tabular-nums">
                  {progressPercent}%
                </span>
                <span className="text-[10px] uppercase font-bold text-[#A3E635] tracking-widest mt-0.5">
                  Building
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-white font-display mb-2">
              Creating your plan...
            </h2>
            <p className="text-sm text-slate-300 max-w-[260px] min-h-[40px] transition-all">
              {loadingSteps[loadingStatusIndex]}
            </p>

            {/* Checklist of generated components */}
            <div className="w-full max-w-[280px] mt-6 space-y-2 text-left">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-4 h-4 rounded-full bg-[#A3E635] text-slate-950 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <span>Focus: {focusArea === 'chest' ? 'Chest' : focusArea === 'abs' ? 'Abs' : 'Full body'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-4 h-4 rounded-full bg-[#A3E635] text-slate-950 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <span>Targeting {weight}kg · {height}cm · {age}y/o</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-4 h-4 rounded-full bg-[#A3E635] text-slate-950 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <span>
                  {selectedEquipment.includes('dumbbell')
                    ? 'Dumbbells loaded (≥3 exercises per day)'
                    : `Equipment calibrated (${selectedEquipment.length} loaded)`}
                </span>
              </div>
            </div>

            {saveError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex flex-col items-center gap-2">
                <span>{saveError}</span>
                <button
                  type="button"
                  onClick={handleExecuteSave}
                  className="px-4 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition-colors cursor-pointer"
                >
                  Try again
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
