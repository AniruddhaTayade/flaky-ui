import { useState, useRef, useCallback } from 'react';
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
import { generateFromUrl, generateFromScreenshot, generateWithJobQueue } from './api/generate';

function AppContent() {
  const { isDark } = useTheme();
  const [jobState, setJobState] = useState({
    isActive: false,
    isComplete: false,
    showCode: false,
    showReport: false,
    framework: 'playwright',
    url: '',
    currentStep: -1,
    isRealGeneration: false,
    isScreenshotMode: false,
    generatedFiles: null,
    testCount: null,
    summary: null,
    error: null,
    jobId: null,
    reportUrl: null
  });

  const stepTimerRef = useRef(null);

  const clearStepTimer = () => {
    if (stepTimerRef.current) {
      stepTimerRef.current.forEach(t => clearTimeout(t));
      stepTimerRef.current = null;
    }
  };

  const handleJobStart = async ({ url, file, framework, isManual }) => {
    console.log('[DEBUG] onJobStart called with:', { url, file, framework, isManual });
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
        isScreenshotMode: !!file,
        generatedFiles: null,
        testCount: null,
        summary: null,
        error: null,
        jobId: Date.now().toString(),
        reportUrl: null
      });
      toast.info('Starting test generation...', {
        description: url ? `Analyzing ${url}` : `Analyzing uploaded screenshot`
      });
      return;
    }

    const newJobId = Date.now().toString();
    setJobState({
      isActive: true,
      isComplete: false,
      showCode: false,
      showReport: false,
      framework,
      url: url || 'uploaded screenshot',
      currentStep: 0,
      isRealGeneration: true,
      isScreenshotMode: !!file,
      generatedFiles: null,
      testCount: null,
      summary: null,
      error: null,
      jobId: newJobId,
      reportUrl: null
    });

    toast.info('Starting test generation...', {
      description: url ? `Analyzing ${url}` : `Analyzing uploaded screenshot`
    });

    stepTimerRef.current = [
      setTimeout(() => setJobState(prev => {
        if (prev.isComplete || prev.currentStep >= 4) return prev;
        return { ...prev, currentStep: 1 };
      }), 2000),
      setTimeout(() => setJobState(prev => {
        if (prev.isComplete || prev.currentStep >= 4) return prev;
        return { ...prev, currentStep: 2 };
      }), 4000),
      setTimeout(() => setJobState(prev => {
        if (prev.isComplete || prev.currentStep >= 4) return prev;
        return { ...prev, currentStep: 3 };
      }), 6000)
    ];

    try {
      let result;
      const stepMap = {
        pending: -1,
        scraping: 0,
        analyzing: 1,
        generating: 2,
        executing: 3,
        complete: 4
      };

      const statusCallback = (statusUpdate) => {
        const step = stepMap[statusUpdate.status] ?? -1;
        setJobState(prev => {
          if (prev.isComplete) return prev;
          if (step < prev.currentStep) return prev;
          return { ...prev, currentStep: step };
        });
      };

      if (file) {
        // Use job queue for screenshots too
        console.log('[DEBUG] Processing file for upload:', file);
        let imageFile;
        if (file.rawFile) {
          console.log('[DEBUG] Using rawFile directly:', file.rawFile);
          imageFile = file.rawFile;
        } else {
          console.log('[DEBUG] Fetching from preview URL:', file.preview);
          const response = await fetch(file.preview);
          const blob = await response.blob();
          imageFile = new File([blob], file.name, { type: blob.type });
        }
        console.log('[DEBUG] Calling generateWithJobQueue with screenshot:', imageFile.name, imageFile.type, imageFile.size);
        console.log('[DEBUG] imageFile being passed:', imageFile);
        console.log('[DEBUG] imageFile instanceof File:', imageFile instanceof File);
        result = await generateWithJobQueue(null, framework, statusCallback, imageFile);
      } else {
        console.log('[DEBUG] Calling generateWithJobQueue with URL:', url);
        result = await generateWithJobQueue(url, framework, statusCallback);
      }

      clearStepTimer();

      console.log('[DEBUG] Job complete, result object:', result);
      console.log('[DEBUG] result.files:', result?.files);
      console.log('[DEBUG] result.files length:', result?.files?.length);

      setJobState(prev => {
        console.log('[DEBUG] setJobState called, setting generatedFiles to:', result.files);
        return {
          ...prev,
          currentStep: 4,
          isComplete: true,
          generatedFiles: result.files,
          testCount: result.test_count,
          summary: result.summary,
          reportUrl: result.report_url
        };
      });

      setTimeout(() => {
        setJobState(prev => {
          if (!prev.isComplete) return prev;
          return { ...prev, showCode: true };
        });
      }, 500);

      setTimeout(() => {
        setJobState(prev => {
          if (!prev.isComplete) return prev;
          return { ...prev, showReport: true };
        });
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

  const handleJobComplete = useCallback(() => {
    setJobState(prev => {
      if (prev.isRealGeneration || prev.isComplete) return prev;

      setTimeout(() => {
        setJobState(p => ({ ...p, showCode: true }));
      }, 500);

      setTimeout(() => {
        setJobState(p => ({ ...p, showReport: true }));
      }, 1500);

      return { ...prev, isComplete: true, currentStep: 4 };
    });
  }, []);

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
      error: null,
      jobId: Date.now().toString()
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
                isComplete={jobState.isComplete}
                isScreenshotMode={jobState.isScreenshotMode}
                onComplete={handleJobComplete}
              />

              <CodeViewer
                key={jobState.jobId || 'demo'}
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
                reportUrl={jobState.reportUrl}
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
