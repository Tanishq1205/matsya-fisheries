import React, { useEffect, useRef, useState } from 'react';

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  duration = 1100, // 1.1s for a relaxed, luxury glide
  direction = 'up',
}) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const currentTarget = domRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, []);

  const getTransformClasses = () => {
    if (direction === 'up') {
      return isVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-14';
    }
    if (direction === 'down') {
      return isVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 -translate-y-14';
    }
    return isVisible ? 'opacity-100' : 'opacity-0';
  };

  return (
    <div
      ref={domRef}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`transition-all will-change-transform ${getTransformClasses()} ${className}`}
    >
      {children}
    </div>
  );
}