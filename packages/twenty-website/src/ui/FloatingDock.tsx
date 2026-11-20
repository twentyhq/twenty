'use client';

import { styled } from '@linaria/react';
import { type ReactNode, useEffect, useState } from 'react';

import {
  buildSchemeContext,
  color,
  DURATION,
  EASING,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
  spacing,
  Z_INDEX,
} from '@/tokens';

const DockRoot = styled.div`
  ${buildSchemeContext('dark')}
  align-items: center;
  background-color: ${semanticColor.surface};
  border: 1px solid ${semanticColor.lineStrong};
  border-radius: ${radius(3)};
  bottom: ${spacing(4)};
  box-shadow:
    inset 0 1px 0 ${color('white-10')},
    ${SHADOW.popupDark};
  display: flex;
  gap: ${spacing(4)};
  left: 50%;
  max-width: calc(100vw - ${spacing(8)});
  opacity: 0;
  padding: ${spacing(2)};
  pointer-events: none;
  position: fixed;
  transform: translate3d(-50%, ${spacing(6)}, 0);
  transition:
    opacity ${DURATION.md} ${EASING.gentle},
    transform ${DURATION.lg} ${EASING.standard},
    visibility 0s linear ${DURATION.lg};
  visibility: hidden;
  white-space: nowrap;
  z-index: ${Z_INDEX.floatingNav};

  ${mediaUp('sm')} {
    padding-left: ${spacing(4)};
  }

  &[data-visible] {
    opacity: 1;
    pointer-events: auto;
    transform: translate3d(-50%, 0, 0);
    transition-delay: 0s;
    visibility: visible;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

// Small screens keep the action alone.
const DockArgument = styled.div`
  align-items: center;
  display: none;
  gap: ${spacing(2)};

  ${mediaUp('sm')} {
    display: flex;
  }
`;

const DockMedia = styled.div`
  flex-shrink: 0;
  height: 32px;
  margin-block: -4px;
  width: 32px;
`;

const DockLabel = styled.p`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  letter-spacing: -0.01em;
  white-space: nowrap;
`;

export type FloatingDockProps = {
  action: ReactNode;
  label: string;
  media?: ReactNode;
};

// Keeps the page's primary action within reach: shows whenever none of the
// elements marked data-dock-anchor is on screen, so it never shows twice.
export function FloatingDock({ action, label, media }: FloatingDockProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const visibleAnchors = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visibleAnchors.add(entry.target);
        } else {
          visibleAnchors.delete(entry.target);
        }
      }
      setIsVisible(visibleAnchors.size === 0);
    });
    for (const anchor of document.querySelectorAll('[data-dock-anchor]')) {
      observer.observe(anchor);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <DockRoot
      aria-hidden={!isVisible}
      data-scheme="dark"
      data-visible={isVisible ? '' : undefined}
    >
      <DockArgument>
        {media !== undefined && <DockMedia aria-hidden>{media}</DockMedia>}
        <DockLabel>{label}</DockLabel>
      </DockArgument>
      {action}
    </DockRoot>
  );
}
