import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share, PlusSquare, X, ArrowDown } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

// ─── iOS instruction bottom sheet ─────────────────────────────────────────────
function IOSSheet({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);

  return (
    <AnimatePresence>
      <motion.div
        key="ios-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'flex-end',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          style={{
            width: '100%',
            background: '#1E293B',
            borderRadius: '20px 20px 0 0',
            border: '1px solid rgba(163,230,53,0.15)',
            borderBottom: 'none',
            padding: '24px 20px',
            paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
          }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#334155', margin: '0 auto 20px' }} />

          {/* Close */}
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: '#0F172A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={15} color="#94A3B8" />
          </button>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: '#94A3B8', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
              Add to Home Screen
            </p>
            <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 900, lineHeight: 1.2 }}>
              Install HomeFit 30
            </h3>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background: step >= i ? '#A3E635' : '#1E293B',
                  border: '1px solid',
                  borderColor: step >= i ? '#A3E635' : '#334155',
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </div>

          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ textAlign: 'center' }}
            >
              {/* Animated arrow pointing down (toward the share bar) */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                style={{ marginBottom: 12 }}
              >
                <ArrowDown size={28} color="#A3E635" style={{ margin: '0 auto' }} />
              </motion.div>

              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: 'rgba(163,230,53,0.1)',
                border: '2px solid rgba(163,230,53,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Share size={28} color="#A3E635" />
              </div>
              <p style={{ color: '#fff', fontSize: 17, fontWeight: 800, marginBottom: 6 }}>
                Tap the Share icon
              </p>
              <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.5 }}>
                Find it at the bottom of your Safari browser bar
              </p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: 'rgba(163,230,53,0.1)',
                border: '2px solid rgba(163,230,53,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <PlusSquare size={28} color="#A3E635" />
              </div>
              <p style={{ color: '#fff', fontSize: 17, fontWeight: 800, marginBottom: 6 }}>
                Tap "Add to Home Screen"
              </p>
              <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.5 }}>
                Scroll down in the share sheet and tap "Add to Home Screen"
              </p>
            </motion.div>
          )}

          {/* Action button */}
          <div style={{ marginTop: 28 }}>
            {step === 0 ? (
              <button
                onClick={() => setStep(1)}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14,
                  background: '#A3E635', color: '#0F172A',
                  fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer',
                }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={onClose}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14,
                  background: '#A3E635', color: '#0F172A',
                  fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer',
                }}
              >
                Got it ✓
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Install Button ───────────────────────────────────────────────────────────
export interface InstallButtonProps {
  className?: string;
}

export const InstallButton: React.FC<InstallButtonProps> = () => {
  const { showInstallButton, isIOS, canInstallNatively, triggerInstall, dismissForWeek } =
    useInstallPrompt();
  const [showIOSSheet, setShowIOSSheet] = useState(false);

  if (!showInstallButton) return null;

  const handleClick = async () => {
    if (isIOS) {
      setShowIOSSheet(true);
      return;
    }
    if (canInstallNatively) {
      const outcome = await triggerInstall();
      if (outcome === 'dismissed') {
        dismissForWeek();
      }
    }
  };

  const handleCloseSheet = () => {
    setShowIOSSheet(false);
    dismissForWeek();
  };

  const label = isIOS ? 'Add to Home Screen' : 'Install App';

  return (
    <>
      <motion.button
        id="install-app-btn"
        onClick={handleClick}
        style={{
          width: '100%',
          padding: '13px 16px',
          borderRadius: 14,
          background: 'transparent',
          border: '1.5px solid rgba(163,230,53,0.5)',
          color: '#A3E635',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          letterSpacing: '0.01em',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.35 }}
        whileTap={{ scale: 0.97 }}
        whileHover={{
          borderColor: 'rgba(163,230,53,0.85)',
          background: 'rgba(163,230,53,0.06)',
        }}
      >
        <Download size={15} strokeWidth={2.5} />
        {label}
      </motion.button>

      {showIOSSheet && <IOSSheet onClose={handleCloseSheet} />}
    </>
  );
};
