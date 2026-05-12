'use client';

import { css } from '@linaria/core';
import { useEffect, useRef, useState } from 'react';

const STAGGER_DELAY_MS = 120;
const VIEWPORT_THRESHOLD = 0.15;

const entranceBaseClassName = css`
  transition:
    opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);

  @media (prefers-reduced-motion: reduce) {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
`;

const hiddenDropClassName = css`
  opacity: 0;
  transform: translateY(60px) rotate(2deg);
`;

const hiddenFromLeftClassName = css`
  opacity: 0;
  transform: translateX(-40px) translateY(30px) rotate(-3deg);
`;

const hiddenFromRightClassName = css`
  opacity: 0;
  transform: translateX(40px) translateY(30px) rotate(3deg);
`;

const visibleClassName = css`
  opacity: 1;
  transform: translateX(0) translateY(0) rotate(0deg);
`;

function getHiddenClassName(index: number): string {
  if (index === 0) return hiddenDropClassName;
  const gridIndex = index - 1;
  const isLeft = gridIndex % 2 === 0;
  return isLeft ? hiddenFromLeftClassName : hiddenFromRightClassName;
}

type FeatureScrollEntranceProps = {
  children: React.ReactNode;
  className?: string;
  index: number;
};

export function FeatureScrollEntrance({
  children,
  className = '',
  index,
}: FeatureScrollEntranceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    let staggerTimeout: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          staggerTimeout = setTimeout(
            () => setIsVisible(true),
            index * STAGGER_DELAY_MS,
          );
        } else {
          if (staggerTimeout) {
            clearTimeout(staggerTimeout);
            staggerTimeout = null;
          }
          setIsVisible(false);
        }
      },
      { threshold: VIEWPORT_THRESHOLD },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (staggerTimeout) clearTimeout(staggerTimeout);
    };
  }, [index]);

  const stateClass = isVisible ? visibleClassName : getHiddenClassName(index);

  return (
    <div
      className={`${entranceBaseClassName} ${stateClass} ${className}`}
      ref={ref}
      style={{ height: '100%', width: '100%' }}
    >
      {children}
    </div>
  );
}
