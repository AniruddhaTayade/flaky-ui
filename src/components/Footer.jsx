import { motion } from 'framer-motion';
import GithubIcon from './icons/GithubIcon';

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: '80px',
        borderTop: '1px solid var(--border-subtle)',
        padding: '32px',
      }}
    >
      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        className="footer-content"
      >
        <span
          className="gradient-text"
          style={{
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          Flaky
        </span>

        <span
          style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
          }}
        >
          Built by Aniruddha Tayade
        </span>

        <motion.a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          whileHover={{ color: 'var(--text)' }}
        >
          <GithubIcon style={{ width: '20px', height: '20px' }} />
        </motion.a>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-content {
            flex-direction: column !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </footer>
  );
}
