'use client';

import { useEffect, useRef, useState } from 'react';

import { styled } from '@linaria/react';

import { MarkerCursor } from '@/sections/ThreeCards/components/FeatureCard/components/MarkerCursor';
import { theme } from '@/theme';

const CURSOR_COLOR = '#ffb08d';
const CURSOR_NAME = 'Alice';
const TARGET_ROW_ID = 'anthropic';
const CURSOR_START = { left: 72, top: 78 };
const TARGET_FALLBACK = { left: 24, top: 22 };
const TARGET_X_OFFSET_PX = 80;
const TARGET_Y_OFFSET_PX = -5;

type Coordinate = { left: number; top: number };

const Overlay = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 3;
`;

const Marker = styled.div<{
  $clicking: boolean;
  $hidden: boolean;
  $left: number;
  $moveMs: number;
  $top: number;
}>`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 6px;
  left: ${({ $left }) => `${$left}%`};
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  position: absolute;
  top: ${({ $top }) => `${$top}%`};
  transform: ${({ $clicking }) => ($clicking ? 'scale(0.86)' : 'scale(1)')};
  transform-origin: top left;
  transition:
    left ${({ $moveMs }) => `${$moveMs}ms`} cubic-bezier(0.22, 1, 0.36, 1),
    top ${({ $moveMs }) => `${$moveMs}ms`} cubic-bezier(0.22, 1, 0.36, 1),
    opacity 180ms ease,
    transform 150ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: opacity 180ms ease;
  }
`;

const Label = styled.span`
  background: ${CURSOR_COLOR};
  border-radius: 4px;
  color: #1f1f1f;
  font-family: ${theme.font.family.mono};
  font-size: 12px;
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.02em;
  line-height: 1;
  padding: 5px 8px;
  text-transform: uppercase;
  width: fit-content;
`;

type ProductHeroCursorProps = {
  clicking: boolean;
  hidden: boolean;
  moveMs: number;
  position: 'start' | 'target';
};

export function ProductHeroCursor({
  clicking,
  hidden,
  moveMs,
  position,
}: ProductHeroCursorProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<Coordinate>(TARGET_FALLBACK);

  useEffect(() => {
    const measure = () => {
      const overlay = overlayRef.current;
      const scene = overlay?.parentElement;

      if (!overlay || !scene) {
        return;
      }

      const row = scene.querySelector(`[data-row-id="${TARGET_ROW_ID}"]`);

      if (!(row instanceof HTMLElement)) {
        return;
      }

      const overlayRect = overlay.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();

      if (rowRect.height === 0 || overlayRect.width === 0) {
        return;
      }

      const x = rowRect.left + TARGET_X_OFFSET_PX - overlayRect.left;
      const y =
        rowRect.top + rowRect.height / 2 + TARGET_Y_OFFSET_PX - overlayRect.top;

      setTarget({
        left: (x / overlayRect.width) * 100,
        top: (y / overlayRect.height) * 100,
      });
    };

    measure();
    window.addEventListener('resize', measure);

    // Rows animate in with a stagger; re-measure once they have settled.
    const settleTimers = [300, 700, 1200].map((delay) =>
      setTimeout(measure, delay),
    );

    return () => {
      window.removeEventListener('resize', measure);
      settleTimers.forEach(clearTimeout);
    };
  }, []);

  const coordinate = position === 'target' ? target : CURSOR_START;

  return (
    <Overlay aria-hidden="true" ref={overlayRef}>
      <Marker
        $clicking={clicking}
        $hidden={hidden}
        $left={coordinate.left}
        $moveMs={moveMs}
        $top={coordinate.top}
      >
        <MarkerCursor color={CURSOR_COLOR} rotation={132} />
        <Label>{CURSOR_NAME}</Label>
      </Marker>
    </Overlay>
  );
}
