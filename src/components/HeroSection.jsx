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
  const [urlError, setUrlError] = useState('');
  const [fileError, setFileError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    console.log('[DEBUG] onDrop called, accepted:', acceptedFiles, 'rejected:', rejectedFiles);
    setFileError('');

    if (rejectedFiles?.length > 0) {
      console.log('[DEBUG] Files rejected:', rejectedFiles);
      const reason = rejectedFiles[0]?.errors?.[0]?.message || 'Invalid file type';
      setFileError(`Upload failed: ${reason}. Please use PNG, JPG, or JPEG.`);
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      console.log('[DEBUG] File object before processing:', file);
      console.log('[DEBUG] File details - name:', file.name, 'type:', file.type, 'size:', file.size);

      // Validate file object
      if (!file || !file.name || !file.type) {
        console.error('[DEBUG] Invalid file object:', file);
        setFileError('Invalid file object received');
        return;
      }

      // Store the raw File object and create preview URL
      const previewUrl = URL.createObjectURL(file);
      console.log('[DEBUG] Created preview URL:', previewUrl);

      const newFile = {
        name: file.name,
        preview: previewUrl,
        type: file.type,
        size: file.size,
        rawFile: file  // Store raw File object for API upload
      };

      console.log('[DEBUG] Setting uploadedFile state with:', newFile);
      setUploadedFile(newFile);
      setUrl(''); // Clear URL when file is uploaded
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    disabled: isLoading,
    noClick: false,
    noKeyboard: false
  });

  const URL_PLACEHOLDER = 'https://example.com';
  const trimmedUrl = url.trim();
  const hasUrl = trimmedUrl.length > 0 && trimmedUrl !== URL_PLACEHOLDER;
  const hasFile = !!uploadedFile;
  const hasBoth = hasUrl && hasFile;
  const hasNeither = !hasUrl && !hasFile;

  const getButtonState = () => {
    if (hasBoth) return { disabled: true, message: 'Please use either a URL or a screenshot, not both' };
    if (hasNeither) return { disabled: true, message: null };
    return { disabled: false, message: null };
  };

  const buttonState = getButtonState();

  const handleGenerate = () => {
    if (isLoading || buttonState.disabled) return;

    console.log('[DEBUG] handleGenerate called, url:', url, 'uploadedFile:', uploadedFile);

    setUrlError('');
    setFileError('');
    setIsLoading(true);

    if (hasFile) {
      console.log('[DEBUG] Starting job with screenshot:', uploadedFile.name);
      console.log('[DEBUG] Raw file object:', uploadedFile.rawFile);
      onJobStart({ url: null, file: uploadedFile, framework, isManual: true });
    } else {
      console.log('[DEBUG] Starting job with URL:', url);
      onJobStart({ url, file: null, framework, isManual: true });
    }

    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    if (urlError) setUrlError('');
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
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          {/* URL Input Section */}
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '16px 16px 0 0',
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
              onChange={handleUrlChange}
              onFocus={() => setIsUrlFocused(true)}
              onBlur={() => setIsUrlFocused(false)}
              placeholder={URL_PLACEHOLDER}
              disabled={isLoading}
              style={{
                width: '100%',
                background: 'var(--input-bg)',
                border: `1px solid ${urlError ? '#ef4444' : isUrlFocused ? '#7c3aed' : 'var(--border)'}`,
                borderRadius: '10px',
                padding: '12px 16px',
                color: 'var(--text)',
                fontSize: '15px',
                outline: 'none',
                boxShadow: urlError
                  ? '0 0 0 3px rgba(239, 68, 68, 0.15)'
                  : isUrlFocused
                  ? '0 0 0 3px rgba(124, 58, 237, 0.15)'
                  : 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                opacity: isLoading ? 0.6 : 1,
              }}
            />
            {urlError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: '13px',
                  color: '#ef4444',
                  marginTop: '8px',
                  marginBottom: 0,
                }}
              >
                {urlError}
              </motion.p>
            )}
          </div>

          {/* OR Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 24px',
              background: 'var(--card-bg)',
              borderLeft: '1px solid var(--border)',
              borderRight: '1px solid var(--border)',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              OR
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Helper Text */}
          <div
            style={{
              padding: '0 24px 16px',
              background: 'var(--card-bg)',
              borderLeft: '1px solid var(--border)',
              borderRight: '1px solid var(--border)',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                margin: 0,
                textAlign: 'center',
              }}
            >
              Don't have a link? A screenshot is enough.
            </p>
          </div>

          {/* Screenshot Dropzone Section */}
          <div
            style={{
              background: 'var(--card-bg)',
              borderLeft: '1px solid var(--border)',
              borderRight: '1px solid var(--border)',
              padding: '0 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <div
              {...getRootProps()}
              style={{
                minHeight: '120px',
                border: `2px dashed ${isDragActive ? '#7c3aed' : 'var(--border-medium)'}`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
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
                      padding: '8px',
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={uploadedFile.preview}
                        alt="Preview"
                        style={{
                          maxHeight: '60px',
                          maxWidth: '120px',
                          borderRadius: '6px',
                          objectFit: 'contain',
                          border: '2px solid #10b981',
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (uploadedFile?.preview) {
                            URL.revokeObjectURL(uploadedFile.preview);
                          }
                          setUploadedFile(null);
                          setFileError('');
                        }}
                        disabled={isLoading}
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
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <X style={{ width: '12px', height: '12px', color: 'white' }} />
                      </button>
                    </div>
                    <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 500 }}>
                      ✓ {uploadedFile.name}
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
            {fileError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: '13px',
                  color: '#ef4444',
                  marginTop: '8px',
                  marginBottom: 0,
                }}
              >
                {fileError}
              </motion.p>
            )}
          </div>

          {/* Generate Button - Full Width */}
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '0 0 16px 16px',
              padding: '24px',
              borderTop: 'none',
            }}
          >
            {buttonState.message && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: '13px',
                  color: '#ef4444',
                  marginBottom: '12px',
                  marginTop: 0,
                  textAlign: 'center',
                }}
              >
                {buttonState.message}
              </motion.p>
            )}
            <motion.button
              onClick={handleGenerate}
              disabled={isLoading || buttonState.disabled}
              className="shimmer-btn"
              style={{
                width: '100%',
                height: '52px',
                background: buttonState.disabled && !isLoading
                  ? 'var(--border)'
                  : 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '16px',
                fontWeight: 600,
                cursor: isLoading || buttonState.disabled ? 'not-allowed' : 'pointer',
                opacity: isLoading || buttonState.disabled ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              whileHover={!isLoading && !buttonState.disabled ? { opacity: 0.9, scale: 1.01 } : {}}
              whileTap={!isLoading && !buttonState.disabled ? { scale: 0.99 } : {}}
            >
              {isLoading ? (
                <>
                  <motion.div
                    style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Generating...
                </>
              ) : hasNeither ? (
                'Enter a URL or upload a screenshot'
              ) : (
                'Generate Tests'
              )}
            </motion.button>
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
                disabled={isLoading}
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
                  cursor: isLoading ? 'not-allowed' : 'pointer',
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
        @media (max-width: 540px) {
          .hero-input-card {
            padding: 16px !important;
          }
        }
      `}</style>
    </section>
  );
}
