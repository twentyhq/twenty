'use client';

import { useEffect, useRef, useState } from 'react';

import { styled } from '@linaria/react';

import { MarkerCursor } from '@/sections/ThreeCards/components/FeatureCard/components/MarkerCursor';
import { theme } from '@/theme';
import type { CursorTarget } from './use-product-hero-cursor-autoplay';

const CURSOR_COLOR = '#ffb08d';
const CURSOR_NAME = 'Alice';
const CURSOR_START = { left: 72, top: 78 };
const ROW_X_OFFSET_PX = 80;
const ROW_Y_OFFSET_PX = -5;
const RAIL_X_OFFSET_PX = -4;
const RAIL_Y_OFFSET_PX = -4;
const TAB_X_OFFSET_PX = 2;
const TAB_Y_OFFSET_PX = -6;

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
  target: CursorTarget;
};

export function ProductHeroCursor({
  clicking,
  hidden,
  moveMs,
  target,
}: ProductHeroCursorProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [coordinate, setCoordinate] = useState<Coordinate>(CURSOR_START);

  useEffect(() => {
    if (target.kind === 'start') {
      setCoordinate(CURSOR_START);
      return undefined;
    }

    const selector =
      target.kind === 'row'
        ? `[data-row-id="${target.id}"]`
        : target.kind === 'rail'
          ? `[data-rail-item-id="${target.id}"]`
          : `[data-record-tab="${target.id}"]`;

    const measure = () => {
      const overlay = overlayRef.current;
      const scene = overlay?.parentElement;

      if (!overlay || !scene) {
        return;
      }

      const element = scene.querySelector(selector);

      if (!(element instanceof HTMLElement)) {
        return;
      }

      const overlayRect = overlay.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      if (elementRect.height === 0 || overlayRect.width === 0) {
        return;
      }

      const xOffset =
        target.kind === 'row'
          ? ROW_X_OFFSET_PX
          : target.kind === 'rail'
            ? RAIL_X_OFFSET_PX
            : TAB_X_OFFSET_PX;
      const yOffset =
        target.kind === 'row'
          ? ROW_Y_OFFSET_PX
          : target.kind === 'rail'
            ? RAIL_Y_OFFSET_PX
            : TAB_Y_OFFSET_PX;
      const x =
        target.kind === 'row'
          ? elementRect.left + xOffset - overlayRect.left
          : elementRect.left +
            elementRect.width / 2 +
            xOffset -
            overlayRect.left;
      const y =
        elementRect.top + elementRect.height / 2 + yOffset - overlayRect.top;

      setCoordinate({
        left: (x / overlayRect.width) * 100,
        top: (y / overlayRect.height) * 100,
      });
    };

    measure();
    window.addEventListener('resize', measure);

    const settleTimers = [120, 360, 720].map((delay) =>
      setTimeout(measure, delay),
    );

    return () => {
      window.removeEventListener('resize', measure);
      settleTimers.forEach(clearTimeout);
    };
  }, [target]);

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
