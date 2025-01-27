import { useEffect } from 'react';
import styles from './SuccessAnimation.module.css';

export default function SuccessAnimation({ onComplete }: { onComplete?: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={styles.overlay}>
      <div className={styles.success}>
        {['S', 'U', 'C', 'C', 'E', 'S', 'S'].map((letter, index) => (
          <span key={index} className={styles.letter} style={{ animationDelay: `${index * 0.1}s` }}>
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
} 