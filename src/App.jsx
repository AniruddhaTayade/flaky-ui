import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import JobStatusCard from './components/JobStatusCard';
import CodeViewer from './components/CodeViewer';
import ReportCard from './components/ReportCard';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import { generateFromUrl, generateFromScreenshot } from './api/generate';

function AppContent() {
  const { isDark } = useTheme();
  const [jobState, setJobState] = useState({
    isActive: false,
    isComplete: false,
    showCode: false,
    showReport: false,
    framework: 'playwright',
    url: 'https://saucedemo.com',
    currentStep: -1,
    isRealGeneration: false,
    generatedFiles: null,
    testCount: null,
    summary: null,
    error: null
  });

  const stepTimerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setJobState(prev => ({ ...prev, isActive: true, currentStep: 0, isRealGeneration: false }));
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const clearStepTimer = () => {
    if (stepTimerRef.current) {
      stepTimerRef.current.forEach(t => clearTimeout(t));
      stepTimerRef.current = null;
    }
  };

  const handleJobStart = async ({ url, file, framework, isManual }) => {
    clearStepTimer();

    if (!isManual) {
      setJobState({
        isActive: true,
        isComplete: false,
        showCode: false,
        showReport: false,
        framework,
        url: url || 'https://example.com',
        currentStep: 0,
        isRealGeneration: false,
        generatedFiles: null,
        testCount: null,
        summary: null,
        error: null
      });
      toast.info('Starting test generation...', {
        description: url ? `Analyzing ${url}` : `Analyzing uploaded screenshot`
      });
      return;
    }

    setJobState({
      isActive: true,
      isComplete: false,
      showCode: false,
      showReport: false,
      framework,
      url: url || 'uploaded screenshot',
      currentStep: 0,
      isRealGeneration: true,
      generatedFiles: null,
      testCount: null,
      summary: null,
      error: null
    });

    toast.info('Starting test generation...', {
      description: url ? `Analyzing ${url}` : `Analyzing uploaded screenshot`
    });

    stepTimerRef.current = [
      setTimeout(() => setJobState(prev => ({ ...prev, currentStep: 1 })), 2000),
      setTimeout(() => setJobState(prev => ({ ...prev, currentStep: 2 })), 4000),
      setTimeout(() => setJobState(prev => ({ ...prev, currentStep: 3 })), 6000)
    ];

    try {
      let result;
      if (file) {
        const response = await fetch(file.preview);
        const blob = await response.blob();
        const imageFile = new File([blob], file.name, { type: blob.type });
        result = await generateFromScreenshot(imageFile, framework);
      } else {
        result = await generateFromUrl(url, framework);
      }

      clearStepTimer();

      setJobState(prev => ({
        ...prev,
        currentStep: 4,
        isComplete: true,
        generatedFiles: result.files,
        testCount: result.test_count,
        summary: result.summary
      }));

      setTimeout(() => {
        setJobState(prev => ({ ...prev, showCode: true }));
      }, 500);

      setTimeout(() => {
        setJobState(prev => ({ ...prev, showReport: true }));
      }, 1500);

      toast.success('Tests generated successfully!', {
        description: result.summary
      });

    } catch (error) {
      clearStepTimer();

      setJobState(prev => ({
        ...prev,
        isActive: false,
        isComplete: false,
        currentStep: -1,
        error: error.message
      }));

      toast.error('Generation failed', {
        description: error.message
      });
    }
  };

  const handleJobComplete = () => {
    if (jobState.isRealGeneration) return;

    setJobState(prev => ({ ...prev, isComplete: true, currentStep: 4 }));

    setTimeout(() => {
      setJobState(prev => ({ ...prev, showCode: true }));
    }, 500);

    setTimeout(() => {
      setJobState(prev => ({ ...prev, showReport: true }));
    }, 1500);
  };

  const handleRunAgain = () => {
    clearStepTimer();
    setJobState(prev => ({
      ...prev,
      isActive: true,
      isComplete: false,
      showCode: false,
      showReport: false,
      currentStep: 0,
      isRealGeneration: false,
      generatedFiles: null,
      testCount: null,
      summary: null,
      error: null
    }));
    toast.info('Re-running test generation...');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Toaster
        theme={isDark ? 'dark' : 'light'}
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: isDark ? '#13131f' : '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          },
        }}
      />

      <Navbar />

      <main>
        <HeroSection onJobStart={handleJobStart} />

        <AnimatePresence mode="wait">
          {(jobState.isActive || jobState.isComplete) && (
            <motion.section
              key="job-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                padding: '0 24px 48px',
              }}
            >
              <JobStatusCard
                currentStep={jobState.currentStep}
                isRealGeneration={jobState.isRealGeneration}
                onComplete={handleJobComplete}
              />

              <CodeViewer
                framework={jobState.framework}
                url={jobState.url}
                isVisible={jobState.showCode}
                files={jobState.generatedFiles}
              />

              <ReportCard
                isVisible={jobState.showReport}
                onRunAgain={handleRunAgain}
                testCount={jobState.testCount}
                summary={jobState.summary}
              />
            </motion.section>
          )}
        </AnimatePresence>

        <FeaturesSection />
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
