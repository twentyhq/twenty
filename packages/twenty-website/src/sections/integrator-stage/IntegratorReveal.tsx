'use client';

import { css } from '@linaria/core';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { EASING, REDUCED_MOTION } from '@/tokens';

// Children rise in order once the block enters the viewport. Hidden only
// when motion is welcome, so reduced-motion visitors never wait on it.
const revealClassName = css`
  @media (prefers-reduced-motion: no-preference) {
    & > * {
      opacity: 0;
      transform: translateY(20px);
      transition:
        opacity 900ms ${EASING.gentle},
        transform 900ms ${EASING.standard};
      transition-delay: calc(var(--reveal-order, 0) * 110ms);
    }

    & > *:nth-child(2) {
      --reveal-order: 1;
    }

    & > *:nth-child(3) {
      --reveal-order: 2;
    }

    & > *:nth-child(4) {
      --reveal-order: 3;
    }

    & > *:nth-child(5) {
      --reveal-order: 4;
    }

    &[data-revealed] > * {
      opacity: 1;
      transform: none;
    }
  }

  ${REDUCED_MOTION} {
    & > * {
      transition: none;
    }
  }
`;

type IntegratorRevealProps = {
  children: ReactNode;
  className?: string;
  role?: 'list';
};

// PROTOTYPE: scroll reveal without an animation library.
export function IntegratorReveal({
  children,
  className,
  role,
}: IntegratorRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (element === null) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={[revealClassName, className].filter(Boolean).join(' ')}
      data-revealed={isRevealed ? '' : undefined}
      ref={elementRef}
      role={role}
    >
      {children}
    </div>
  );
}
