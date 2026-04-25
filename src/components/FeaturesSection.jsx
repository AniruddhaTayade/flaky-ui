import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Globe, Code, Cloud } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Globe,
    title: 'Any URL or Screenshot',
    description: 'Point Flaky at any web app and it instantly analyzes the UI, detects interactive elements, and generates comprehensive test suites.'
  },
  {
    icon: Code,
    title: 'Selenium & Playwright',
    description: 'Choose your framework. Flaky generates clean Page Object Model code that follows industry best practices and runs immediately.'
  },
  {
    icon: Cloud,
    title: 'Live Execution on Azure',
    description: 'Tests run in isolated Docker containers on Azure. Get a shareable HTML report link within seconds of generation.'
  }
];

function FeatureCard({ feature, index }) {
  const cardRef = useRef(null);
  const Icon = feature.icon;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    gsap.fromTo(
      card,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        delay: index * 0.15,
      }
    );
  }, [index]);

  return (
    <motion.div
      ref={cardRef}
      style={{
        opacity: 0,
        background: 'var(--card-bg)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: 'var(--card-shadow)',
        transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      whileHover={{
        y: -6,
        borderColor: 'rgba(124, 58, 237, 0.4)',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: 'rgba(124, 58, 237, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <Icon style={{ width: '24px', height: '24px', color: '#7c3aed' }} />
      </div>

      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text)',
          marginBottom: '8px',
        }}
      >
        {feature.title}
      </h3>

      <p
        style={{
          fontSize: '15px',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {feature.description}
      </p>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      style={{
        marginTop: '120px',
        padding: '80px 24px',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <h2
            className="gradient-text"
            style={{
              fontSize: '40px',
              fontWeight: 700,
              marginBottom: '12px',
            }}
          >
            Everything you need
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            From URL to test report in seconds
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}
          className="features-grid"
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
