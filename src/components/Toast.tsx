import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: `translateX(-50%) ${visible ? 'translateY(0)' : 'translateY(20px)'}`,
        opacity: visible ? 1 : 0,
        transition: 'all 300ms ease',
        backgroundColor: 'var(--color-ink)',
        color: 'var(--color-tab-hover)',
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)'
      }}
    >
      <span style={{ opacity: 0.7 }}>○</span>
      {message}
    </div>
  );
}
