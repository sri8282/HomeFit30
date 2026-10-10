import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Dumbbell, Filter, Layers, Check, Sparkles, X } from 'lucide-react';
import { RiggedExerciseAnimation } from '../animations/RiggedExerciseAnimation';
import { EXERCISE_KEYFRAMES, ExerciseKeyframeDef } from '../animations/exerciseKeyframes';
import { ExerciseFigure } from '../animations/ExerciseFigure';

interface AnimationPreviewModalProps {
  onClose: () => void;
}

type MuscleFilter = 'all' | 'chest' | 'back_shoulders' | 'cardio_full' | 'upper_abs' | 'lower_abs' | 'obliques';
type PostureFilter = 'all' | 'standing' | 'lying_back' | 'plank';

export const AnimationPreviewModal: React.FC<AnimationPreviewModalProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleFilter>('all');
  const [selectedPosture, setSelectedPosture] = useState<PostureFilter>('all');
  const [dumbbellsOnly, setDumbbellsOnly] = useState(false);
  const [focusedExercise, setFocusedExercise] = useState<ExerciseKeyframeDef | null>(null);

  const allExercises = useMemo(() => Object.values(EXERCISE_KEYFRAMES), []);

  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = ex.name.toLowerCase().includes(q);
        const matchesArea = ex.targetArea.toLowerCase().includes(q);
        const matchesId = ex.id.toLowerCase().includes(q);
        if (!matchesName && !matchesArea && !matchesId) return false;
      }

      // Dumbbell filter
      if (dumbbellsOnly && !ex.hasDumbbell) return false;

      // Posture filter
      if (selectedPosture !== 'all' && ex.posture !== selectedPosture) return false;

      // Muscle filter
      if (selectedMuscle === 'chest' && ex.targetArea !== 'chest') return false;
      if (selectedMuscle === 'back_shoulders' && ex.targetArea !== 'back' && ex.targetArea !== 'shoulders') return false;
      if (selectedMuscle === 'cardio_full' && ex.targetArea !== 'full body') return false;
      if (selectedMuscle === 'upper_abs' && ex.targetArea !== 'upper abs') return false;
      if (selectedMuscle === 'lower_abs' && ex.targetArea !== 'lower abs') return false;
      if (selectedMuscle === 'obliques' && ex.targetArea !== 'obliques') return false;

      return true;
    });
  }, [allExercises, searchQuery, selectedMuscle, selectedPosture, dumbbellsOnly]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1120] text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="shrink-0 bg-slate-900/95 border-b border-slate-800 p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Back to settings"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white font-display tracking-tight">
                Animation Preview
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#A3E635]/20 text-[#A3E635] text-[10px] font-black uppercase tracking-wider border border-[#A3E635]/30">
                Rigged Figure QA
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {filteredExercises.length} of {allExercises.length} exercises animating smoothly (~2s/rep)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="shrink-0 bg-slate-900/60 border-b border-slate-800 p-3 space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises by name, muscle, or code..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#A3E635]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setDumbbellsOnly((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
              dumbbellsOnly
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <Dumbbell className="w-3 h-3" />
            <span>Dumbbells Only</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMuscle('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
              selectedMuscle === 'all'
                ? 'bg-[#A3E635] text-slate-950 font-black'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            All Areas ({allExercises.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedMuscle('chest')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
              selectedMuscle === 'chest'
                ? 'bg-[#A3E635] text-slate-950 font-black'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            Chest
          </button>

          <button
            type="button"
            onClick={() => setSelectedMuscle('back_shoulders')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
              selectedMuscle === 'back_shoulders'
                ? 'bg-[#A3E635] text-slate-950 font-black'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            Back & Shoulders
          </button>

          <button
            type="button"
            onClick={() => setSelectedMuscle('cardio_full')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
              selectedMuscle === 'cardio_full'
                ? 'bg-[#A3E635] text-slate-950 font-black'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            Full Body & Cardio
          </button>

          <button
            type="button"
            onClick={() => setSelectedMuscle('upper_abs')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
              selectedMuscle === 'upper_abs'
                ? 'bg-[#A3E635] text-slate-950 font-black'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            Upper Abs
          </button>

          <button
            type="button"
            onClick={() => setSelectedMuscle('lower_abs')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
              selectedMuscle === 'lower_abs'
                ? 'bg-[#A3E635] text-slate-950 font-black'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            Lower Abs
          </button>

          <button
            type="button"
            onClick={() => setSelectedMuscle('obliques')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
              selectedMuscle === 'obliques'
                ? 'bg-[#A3E635] text-slate-950 font-black'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            Obliques
          </button>
        </div>

        {/* Posture filter pills */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[9px]">Posture:</span>
          {(['all', 'standing', 'lying_back', 'plank'] as PostureFilter[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPosture(p)}
              className={`px-2 py-0.5 rounded-md capitalize cursor-pointer transition-colors ${
                selectedPosture === p
                  ? 'bg-slate-700 text-[#A3E635] font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Exercise Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 no-scrollbar">
        {filteredExercises.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Filter className="w-8 h-8 text-slate-500 mb-2" />
            <p className="text-sm font-bold text-white">No exercises match your filter</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing search or filters to see all 52 exercises.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedMuscle('all');
                setSelectedPosture('all');
                setDumbbellsOnly(false);
              }}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-[#A3E635] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredExercises.map((ex) => (
              <div
                key={ex.id}
                onClick={() => setFocusedExercise(ex)}
                className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-2.5 flex flex-col justify-between transition-all group cursor-pointer hover:shadow-lg shadow-sm"
              >
                {/* SVG Figure Animation Container */}
                <div className="w-full aspect-square rounded-xl bg-slate-950 border border-slate-800/80 p-1 overflow-hidden relative flex items-center justify-center">
                  <RiggedExerciseAnimation exerciseId={ex.id} />

                  {/* Corner Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                    {ex.hasDumbbell && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[9px] font-bold border border-blue-500/30 flex items-center gap-0.5">
                        <Dumbbell className="w-2.5 h-2.5" />
                        <span>DB</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-slate-900/80 backdrop-blur-sm text-[9px] font-mono text-[#A3E635] border border-slate-800">
                    ~{ex.duration || 2.0}s
                  </div>
                </div>

                {/* Details */}
                <div className="mt-2 text-left">
                  <h4 className="text-xs font-bold text-white group-hover:text-[#A3E635] transition-colors truncate font-display">
                    {ex.name}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                    <span className="capitalize truncate">{ex.targetArea}</span>
                    <span className="capitalize text-slate-500 font-mono text-[9px] shrink-0 ml-1">
                      {ex.posture.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Focus Inspection Modal */}
      {focusedExercise && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setFocusedExercise(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] font-black uppercase tracking-wider text-[#A3E635]">
              Rigged Keyframe Inspector
            </span>
            <h3 className="text-lg font-black text-white font-display mt-0.5">
              {focusedExercise.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">
              {focusedExercise.targetArea} · Posture: {focusedExercise.posture.replace('_', ' ')}
            </p>

            {/* Large Figure Live Preview */}
            <div className="my-4 w-full aspect-square rounded-2xl bg-slate-950 border border-slate-800 p-2 overflow-hidden flex items-center justify-center shadow-inner">
              <RiggedExerciseAnimation exerciseId={focusedExercise.id} />
            </div>

            {/* Keyframe Details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 bg-slate-800/60 p-2 rounded-xl">
                <span>Keyframes Defined:</span>
                <span className="font-bold text-white">{focusedExercise.keyframes.length} Poses</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 bg-slate-800/60 p-2 rounded-xl">
                <span>Cycle Loop Duration:</span>
                <span className="font-bold text-[#A3E635]">{focusedExercise.duration || 2.0}s per Rep</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 bg-slate-800/60 p-2 rounded-xl">
                <span>Dumbbell Equipped:</span>
                <span className="font-bold text-white">
                  {focusedExercise.hasDumbbell ? 'Yes (Rigged in hands)' : 'No (Bodyweight)'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFocusedExercise(null)}
              className="w-full mt-4 h-11 rounded-xl bg-[#A3E635] text-slate-950 font-black text-xs cursor-pointer hover:bg-[#b0f242]"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
