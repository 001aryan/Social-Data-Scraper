import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Sparkles,
  Zap,
  HelpCircle,
  Volume2
} from 'lucide-react';
import { TourStep } from '../types';

interface TourOverlayProps {
  currentStep: number;
  totalSteps: number;
  stepData: TourStep;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function TourOverlay({
  currentStep,
  totalSteps,
  stepData,
  onNext,
  onBack,
  onSkip
}: TourOverlayProps) {
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        id="tour-guide-card"
        className="fixed bottom-6 right-6 md:right-8 z-40 max-w-md w-[calc(100vw-3rem)] bg-gray-950/95 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur-xl overflow-hidden"
      >
        {/* Accent Glow backdrop behind the card content */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-pink-500/5 rounded-full filter blur-xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="relative flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 rounded-md bg-indigo-500/15 border border-indigo-500/25 text-[10px] uppercase font-mono font-bold tracking-wider text-indigo-400">
              {stepData.badge}
            </span>
            <span className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-wider">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>

          <button 
            onClick={onSkip}
            className="p-1 hover:bg-gray-900 border border-transparent hover:border-gray-800 rounded-lg text-gray-500 hover:text-white transition-all cursor-pointer"
            title="Exit Demo Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title and Description */}
        <div className="relative space-y-2 mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans tracking-tight">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            {stepData.title}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            {stepData.description}
          </p>
        </div>

        {/* Bullet features list */}
        <div className="relative pt-3 border-t border-gray-900 mb-5">
          <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold mb-2.5">
            Key Functions & Controls
          </span>
          <ul className="space-y-2">
            {stepData.features.map((feature, idx) => (
              <li key={idx} className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <span className="text-[11px] text-gray-300 font-medium leading-relaxed font-sans">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interactive Controls Panel */}
        <div className="relative pt-4 border-t border-gray-900 flex justify-between items-center bg-gray-950/50">
          <button 
            onClick={onSkip}
            className="text-[10px] font-mono font-bold text-gray-500 hover:text-white tracking-wider uppercase transition-all cursor-pointer"
          >
            Skip Guide
          </button>

          <div className="flex gap-2">
            <button
              onClick={onBack}
              disabled={currentStep === 0}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${currentStep === 0 ? 'bg-transparent border-gray-900 text-gray-600 cursor-not-allowed' : 'bg-gray-950 border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white cursor-pointer'}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <button
              onClick={onNext}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/10 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {currentStep === totalSteps - 1 ? 'Finish Guide' : 'Next Function'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar indicator link background */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900">
          <div 
            className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
