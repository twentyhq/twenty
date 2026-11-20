'use client';

import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { useInView } from './use-in-view';

const RevealRoot = styled.div`
  min-width: 0;
`;

type CreatorRevealProps = {
  children: ReactNode;
  className?: string;
};

// PROTOTYPE marks its subtree with data-revealed once scrolled into view;
// descendants key their entrance on that attribute.
export function CreatorReveal({ children, className }: CreatorRevealProps) {
  const [rootRef, isInView] = useInView<HTMLDivElement>();

  return (
    <RevealRoot
      className={className}
      data-revealed={isInView ? '' : undefined}
      ref={rootRef}
    >
      {children}
    </RevealRoot>
  );
}
