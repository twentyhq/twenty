'use client';

import { styled } from '@linaria/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

const RevealRoot = styled.div`
  min-width: 0;
`;

type RevealProps = {
  children: ReactNode;
};

// Marks its subtree with data-revealed once it scrolls into view, so
// descendants can key their entrance on it instead of playing off screen.
export function Reveal({ children }: RevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (root === null) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <RevealRoot data-revealed={isRevealed ? '' : undefined} ref={rootRef}>
      {children}
    </RevealRoot>
  );
}
