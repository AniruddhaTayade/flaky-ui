import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

const particlesOptions = {
  background: { color: { value: 'transparent' } },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'grab' },
      resize: true
    },
    modes: {
      grab: { distance: 150, links: { opacity: 0.5 } }
    }
  },
  particles: {
    color: { value: ['#7c3aed', '#06b6d4'] },
    links: {
      color: '#7c3aed',
      distance: 150,
      enable: true,
      opacity: 0.3,
      width: 1
    },
    move: {
      enable: true,
      speed: 0.6,
      direction: 'none',
      random: true,
      straight: false,
      outModes: { default: 'bounce' }
    },
    number: { value: 80, density: { enable: true, area: 800 } },
    opacity: { value: { min: 0.4, max: 0.8 } },
    shape: { type: 'circle' },
    size: { value: { min: 2, max: 4 } }
  },
  detectRetina: true
};

const wordVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: 0.3 + i * 0.08,
      duration: 0.5,
      ease: 'easeOut'
    }
  })
};

const line2Variants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      delay: 0.6,
      duration: 0.5,
      ease: 'easeOut'
    }
  }
};

const ParticlesBackground = memo(function ParticlesBackground() {
  return (
    <Particles
      id="tsparticles"
      className="particle-canvas"
      options={particlesOptions}
    />
  );
});

export default function HeroSection({ onJobStart }) {
  const [init, setInit] = useState(false);
  const [url, setUrl] = useState('');
  const [framework, setFramework] = useState('playwright');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUrlFocused, setIsUrlFocused] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFile({
          name: file.name,
          preview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1
  });

  const handleGenerate = () => {
    if (url || uploadedFile) {
      onJobStart({ url, file: uploadedFile, framework });
    }
  };

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 80px',
        overflow: 'hidden',
      }}
    >
      {init && <ParticlesBackground />}

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '860px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1
            style={{
              fontSize: 'clamp(48px, 7vw, 88px)',
              fontWeight: 800,
              lineHeight: 1.1,
              color: 'var(--text)',
              margin: 0,
            }}
          >
            <span style={{ display: 'block', overflow: 'hidden' }}>
              {['Generate', 'E2E', 'tests'].map((word, i) => (
                <motion.span
                  key={word}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={wordVariants}
                  style={{ display: 'inline-block', marginRight: i < 2 ? '0.3em' : 0 }}
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <motion.span
              initial="hidden"
              animate="visible"
              variants={line2Variants}
              className="gradient-text"
              style={{ display: 'block' }}
            >
              from any UI.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            style={{
              fontSize: '18px',
              color: 'var(--text-muted)',
              marginTop: '16px',
            }}
          >
            Tests so good, they're almost flaky.
          </motion.p>
        </div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            alignItems: 'stretch',
          }}
          className="input-grid"
        >
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <label
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                marginBottom: '12px',
              }}
            >
              Enter URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setIsUrlFocused(true)}
              onBlur={() => setIsUrlFocused(false)}
              placeholder="https://example.com"
              style={{
                width: '100%',
                background: 'var(--input-bg)',
                border: `1px solid ${isUrlFocused ? '#7c3aed' : 'var(--border)'}`,
                borderRadius: '10px',
                padding: '12px 16px',
                color: 'var(--text)',
                fontSize: '15px',
                outline: 'none',
                boxShadow: isUrlFocused ? '0 0 0 3px rgba(124, 58, 237, 0.15)' : 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            />
            <motion.button
              onClick={handleGenerate}
              disabled={!url && !uploadedFile}
              className="shimmer-btn"
              style={{
                width: '100%',
                height: '48px',
                marginTop: '12px',
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '15px',
                fontWeight: 600,
                cursor: url || uploadedFile ? 'pointer' : 'not-allowed',
                opacity: url || uploadedFile ? 1 : 0.5,
              }}
              whileHover={url || uploadedFile ? { opacity: 0.9, scale: 1.01 } : {}}
              whileTap={url || uploadedFile ? { scale: 0.99 } : {}}
            >
              Generate Tests
            </motion.button>
          </div>

          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <label
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                marginBottom: '12px',
              }}
            >
              Upload Screenshot
            </label>
            <div
              {...getRootProps()}
              style={{
                flex: 1,
                minHeight: '140px',
                border: `2px dashed ${isDragActive ? '#7c3aed' : 'var(--border-medium)'}`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px',
                cursor: 'pointer',
                background: isDragActive ? 'rgba(124, 58, 237, 0.05)' : 'transparent',
                transition: 'border-color 0.2s, background 0.2s',
              }}
            >
              <input {...getInputProps()} />
              <AnimatePresence mode="wait">
                {uploadedFile ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={uploadedFile.preview}
                        alt="Preview"
                        style={{
                          height: '48px',
                          borderRadius: '6px',
                          objectFit: 'contain',
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                        }}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#ef4444',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <X style={{ width: '12px', height: '12px', color: 'white' }} />
                      </button>
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {uploadedFile.name}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ textAlign: 'center' }}
                  >
                    <Upload
                      style={{
                        width: '32px',
                        height: '32px',
                        color: isDragActive ? '#7c3aed' : 'var(--text-muted)',
                        marginBottom: '4px',
                      }}
                    />
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                      {isDragActive ? 'Drop here' : 'Drop screenshot or click to upload'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '24px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--toggle-bg)',
              border: '1px solid var(--border)',
              borderRadius: '50px',
              padding: '4px',
            }}
          >
            {['selenium', 'playwright'].map((option) => (
              <button
                key={option}
                onClick={() => setFramework(option)}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: '8px 24px',
                  borderRadius: '50px',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: 'none',
                  background: 'transparent',
                  color: framework === option ? 'white' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {framework === option && (
                  <motion.div
                    layoutId="activePill"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50px',
                      background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                      zIndex: -1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .input-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
