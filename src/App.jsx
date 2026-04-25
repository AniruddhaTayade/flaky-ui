import { useState, useEffect } from 'react';
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

function AppContent() {
  const { isDark } = useTheme();
  const [jobState, setJobState] = useState({
    isActive: false,
    isComplete: false,
    showCode: false,
    showReport: false,
    framework: 'playwright',
    url: 'https://saucedemo.com'
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setJobState(prev => ({ ...prev, isActive: true }));
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleJobStart = ({ url, file, framework }) => {
    setJobState({
      isActive: true,
      isComplete: false,
      showCode: false,
      showReport: false,
      framework,
      url: url || 'https://example.com'
    });
    toast.info('Starting test generation...', {
      description: url ? `Analyzing ${url}` : `Analyzing uploaded screenshot`
    });
  };

  const handleJobComplete = () => {
    setJobState(prev => ({ ...prev, isComplete: true }));

    setTimeout(() => {
      setJobState(prev => ({ ...prev, showCode: true }));
    }, 500);

    setTimeout(() => {
      setJobState(prev => ({ ...prev, showReport: true }));
    }, 1500);
  };

  const handleRunAgain = () => {
    setJobState(prev => ({
      ...prev,
      isActive: true,
      isComplete: false,
      showCode: false,
      showReport: false,
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
                isActive={jobState.isActive}
                onComplete={handleJobComplete}
              />

              <CodeViewer
                framework={jobState.framework}
                url={jobState.url}
                isVisible={jobState.showCode}
              />

              <ReportCard
                isVisible={jobState.showReport}
                onRunAgain={handleRunAgain}
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
