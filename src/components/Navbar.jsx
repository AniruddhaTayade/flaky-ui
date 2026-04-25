import { motion } from 'framer-motion';
import { Ghost, Sun, Moon, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '64px',
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--nav-border)',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 32px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Ghost style={{ width: '16px', height: '16px', color: 'var(--primary)' }} />
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
            Flaky
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
            }}
            whileHover={{ color: 'var(--text)' }}
          >
            GitHub
            <ExternalLink style={{ width: '14px', height: '14px' }} />
          </motion.a>

          <motion.button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            whileHover={{ backgroundColor: 'var(--hover-bg)' }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isDark ? 0 : 180 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              {isDark ? (
                <Moon style={{ width: '18px', height: '18px', color: 'var(--text)' }} />
              ) : (
                <Sun style={{ width: '18px', height: '18px', color: 'var(--text)' }} />
              )}
            </motion.div>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
