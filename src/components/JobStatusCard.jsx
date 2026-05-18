import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Globe, Brain, FileCode, Play, CheckCircle2, Check, Image, Cpu } from 'lucide-react';

const URL_STEPS = [
  { id: 'scraping', label: 'Scraping', icon: Globe },
  { id: 'analyzing', label: 'Analyzing', icon: Brain },
  { id: 'generating', label: 'Generating', icon: FileCode },
  { id: 'executing', label: 'Executing', icon: Play },
  { id: 'complete', label: 'Complete', icon: CheckCircle2 }
];

const SCREENSHOT_STEPS = [
  { id: 'analyzing', label: 'Analyzing', icon: Image },
  { id: 'processing', label: 'Processing', icon: Cpu },
  { id: 'generating', label: 'Generating', icon: FileCode },
  { id: 'validating', label: 'Validating', icon: Brain },
  { id: 'complete', label: 'Complete', icon: CheckCircle2 }
];

export default function JobStatusCard({ currentStep: externalStep, isRealGeneration, isComplete, onComplete, isScreenshotMode = false }) {
  const STEPS = isScreenshotMode ? SCREENSHOT_STEPS : URL_STEPS;
  const [internalStep, setInternalStep] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const hasCalledCompleteRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (isComplete) {
      hasCalledCompleteRef.current = true;
    }
  }, [isComplete]);

  const currentStep = isRealGeneration ? externalStep : internalStep;

  useEffect(() => {
    if (isRealGeneration || isComplete) return;

    if (externalStep < 0) {
      setInternalStep(0);
      hasCalledCompleteRef.current = false;
      return;
    }

    const interval = setInterval(() => {
      setInternalStep(prev => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval);
          if (!hasCalledCompleteRef.current) {
            hasCalledCompleteRef.current = true;
            setTimeout(() => onCompleteRef.current?.(), 500);
          }
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isRealGeneration, isComplete, externalStep]);

  if (currentStep < 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{
        marginTop: '48px',
        maxWidth: '860px',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text)',
          marginBottom: '32px',
        }}
      >
        {currentStep >= 4 ? 'Tests generated!' : 'Generating your tests...'}
      </h3>

      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;
          const isLast = index === STEPS.length - 1;

          return (
            <div
              key={step.id}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    top: '22px',
                    left: '50%',
                    right: '-50%',
                    height: '2px',
                    background: 'var(--step-line-bg)',
                    zIndex: 0,
                  }}
                >
                  <motion.div
                    style={{
                      height: '100%',
                      background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    }}
                    initial={{ width: '0%' }}
                    animate={{
                      width: isCompleted ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              )}

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1,
                  background: isCompleted
                    ? 'linear-gradient(135deg, #7c3aed, #06b6d4)'
                    : isCurrent
                    ? 'rgba(124, 58, 237, 0.1)'
                    : 'transparent',
                  border: isCompleted
                    ? 'none'
                    : isCurrent
                    ? '2px solid #7c3aed'
                    : '2px solid var(--border)',
                }}
              >
                {isCurrent && currentStep < 4 && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      inset: '-2px',
                      borderRadius: '50%',
                      border: '2px solid transparent',
                      borderTopColor: '#7c3aed',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                )}
                {isCompleted ? (
                  <Check style={{ width: '20px', height: '20px', color: 'white' }} />
                ) : isCurrent ? (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#7c3aed',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--step-dot-bg)',
                    }}
                  />
                )}
              </motion.div>

              <span
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: isCompleted || isCurrent ? 'var(--text)' : 'var(--text-muted)',
                  textAlign: 'center',
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
