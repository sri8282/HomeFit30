import React, { useState } from 'react';
import { X, RotateCcw, Save, Flame, User, Scale, Ruler, Dumbbell, Target, Check } from 'lucide-react';
import {
  UserProfile,
  saveUserProfile,
  resetAllData,
  calculateBMI,
  Goal,
  FocusArea,
  Equipment,
} from '../dataService';

interface ProfileModalProps {
  profile: UserProfile | null;
  onClose: () => void;
  onProfileUpdated: () => void;
  onResetOnboarding: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onClose,
  onProfileUpdated,
  onResetOnboarding,
}) => {
  const [weight, setWeight] = useState<number>(profile?.weight || 72);
  const [height, setHeight] = useState<number>(profile?.height || 175);
  const [focusArea, setFocusArea] = useState<FocusArea>(profile?.focusArea || 'chest');
  const [isConfirmingReset, setIsConfirmingReset] = useState<boolean>(false);

  const bmiInfo = calculateBMI(height, weight);

  const handleSave = () => {
    if (profile) {
      saveUserProfile({
        ...profile,
        weight,
        height,
        focusArea,
      });
      onProfileUpdated();
      onClose();
    }
  };

  const handleReset = () => {
    resetAllData();
    onResetOnboarding();
  };

  const goalTitleMap: Record<Goal, string> = {
    lose_belly_fat: 'Lose Belly Fat',
    build_abs: 'Build Abs',
    get_stronger: 'Get Stronger',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-[390px] bg-[#0F172A] rounded-t-3xl sm:rounded-3xl border border-slate-800 p-5 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#A3E635]/15 text-[#A3E635] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Athlete Profile</h3>
              <p className="text-xs text-slate-400">Settings & Body Metrics</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          {/* Target Goal Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Current Goal</span>
                <p className="text-sm font-bold text-white">
                  {profile?.goal ? goalTitleMap[profile.goal] : 'Lose Belly Fat'}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#A3E635] bg-[#A3E635]/10 px-2.5 py-1 rounded-full">
              30 Days
            </span>
          </div>

          {/* Equipment Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="w-4 h-4 text-[#A3E635]" />
              <span className="text-xs font-bold text-slate-300 uppercase">Available Equipment</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile?.equipment && profile.equipment.length > 0 ? (
                profile.equipment.map((eq) => (
                  <span
                    key={eq}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700/60 capitalize font-medium"
                  >
                    {eq.replace('_', ' ')}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Bodyweight only</span>
              )}
            </div>
          </div>

          {/* Focus Area Selector */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase">Focus Area</span>
              <span className="text-[11px] font-bold text-[#A3E635] capitalize">
                {focusArea.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'chest', label: 'Chest', icon: '🛡️' },
                  { id: 'abs', label: 'Abs', icon: '⚡' },
                  { id: 'full_body', label: 'Full body', icon: '🔥' },
                ] as const
              ).map((f) => {
                const isSelected = focusArea === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFocusArea(f.id)}
                    className={`py-2 px-1.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#A3E635]/15 border-[#A3E635] text-white shadow-sm'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{f.icon}</span>
                    <span className="truncate">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Body Stats Tuner */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase">Track Body Progress</span>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Scale className="w-4 h-4 text-[#A3E635]" />
                <span>Weight (kg)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWeight((w) => Math.max(35, w - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-bold text-white tabular-nums">
                  {weight} kg
                </span>
                <button
                  type="button"
                  onClick={() => setWeight((w) => Math.min(180, w + 1))}
                  className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Ruler className="w-4 h-4 text-[#A3E635]" />
                <span>Height (cm)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHeight((h) => Math.max(120, h - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-bold text-white tabular-nums">
                  {height} cm
                </span>
                <button
                  type="button"
                  onClick={() => setHeight((h) => Math.min(225, h + 1))}
                  className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* BMI Display */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Calculated BMI</span>
              <span className="font-bold text-[#A3E635]">
                {bmiInfo.bmi} ({bmiInfo.category})
              </span>
            </div>

            {/* Fitness Level from BMI / Age */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Assigned Plan Level</span>
              <span className="font-bold capitalize text-white">
                {bmiInfo.bmi > 27 || (profile?.age && profile.age > 45) ? (
                  <span className="text-amber-400">Beginner (BMI &gt; 27 or Age &gt; 45)</span>
                ) : (
                  <span className="text-[#A3E635]">Intermediate</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-2 space-y-2.5">
          <button
            type="button"
            onClick={handleSave}
            className="w-full h-12 rounded-xl bg-[#A3E635] hover:bg-[#b0f242] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer font-display"
          >
            <Save className="w-4 h-4" />
            <span>Save Updated Metrics</span>
          </button>

          {!isConfirmingReset ? (
            <button
              type="button"
              onClick={() => setIsConfirmingReset(true)}
              className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset & Retake Onboarding</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-2">
              <p className="text-xs text-rose-200 text-center font-medium">
                Reset all answers and start fresh onboarding?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmingReset(false)}
                  className="flex-1 h-9 rounded-lg bg-slate-800 text-xs text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 h-9 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
