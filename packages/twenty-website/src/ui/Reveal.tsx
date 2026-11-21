'use client';

import { styled } from '@linaria/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const RevealRoot = styled.div`
  min-width: 0;
`;

type RevealProps = {
  children: ReactNode;
};

// Lets descendants key their entrance on data-revealed instead of playing off screen.
export function Reveal({ children }: RevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!isDefined(root)) {
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
