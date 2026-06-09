'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { styled } from '@linaria/react';

import { MarkerCursor } from '@/sections/ThreeCards/components/FeatureCard/components/MarkerCursor';
import { theme } from '@/theme';
import type { CursorTarget } from './use-product-hero-cursor-autoplay';

type Coordinate = { left: number; top: number };

export type HeroCursorConfig = {
  color: string;
  home: Coordinate;
  // Resting position used on the phone bleed layout, where the window runs off
  // the right edge; defaults to home when unset. Tune per cursor.
  mobileHome?: Coordinate;
  name: string;
};

export const HERO_CURSORS: HeroCursorConfig[] = [
  {
    name: 'Alice',
    color: '#ffb08d',
    home: { left: 13, top: 34 },
    mobileHome: { left: 13, top: -6 },
  },
  { name: 'Ben', color: '#8db4ff', home: { left: 36, top: 90 } },
  { name: 'Cara', color: '#9ee7c5', home: { left: 90, top: 51 } },
];

const GLIDE_BASE_MS = 500;
const GLIDE_MS_PER_PX = 0.55;
const GLIDE_MIN_MS = 620;
const GLIDE_MAX_MS = 1000;
const GLIDE_SKIP_PX = 6;

const ROW_X_OFFSET_PX = 80;
const ROW_Y_OFFSET_PX = -5;
const RAIL_X_OFFSET_PX = -4;
const RAIL_Y_OFFSET_PX = -4;
const TAB_X_OFFSET_PX = 2;
const TAB_Y_OFFSET_PX = -6;

function pixelDistance(from: Coordinate, to: Coordinate, rect: DOMRect) {
  const dx = ((to.left - from.left) / 100) * rect.width;
  const dy = ((to.top - from.top) / 100) * rect.height;

  return Math.hypot(dx, dy);
}

function glideForDistance(distance: number) {
  return Math.max(
    GLIDE_MIN_MS,
    Math.min(GLIDE_MAX_MS, GLIDE_BASE_MS + distance * GLIDE_MS_PER_PX),
  );
}

const Overlay = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 3;
`;

const Marker = styled.div<{
  $clicking: boolean;
  $glideMs: number;
  $hidden: boolean;
  $left: number;
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
    left ${({ $glideMs }) => `${$glideMs}ms`} cubic-bezier(0.22, 1, 0.36, 1),
    top ${({ $glideMs }) => `${$glideMs}ms`} cubic-bezier(0.22, 1, 0.36, 1),
    opacity 180ms ease,
    transform 150ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: opacity 180ms ease;
  }
`;

const Label = styled.span<{ $color: string }>`
  background: ${({ $color }) => $color};
  border-radius: 4px;
  color: #1f1f1f;
  font-family: ${theme.font.family.mono};
  font-size: 10px;
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.02em;
  line-height: 1;
  padding: 4px 8px;
  text-transform: uppercase;
  width: fit-content;
`;

const HOME_TARGET: CursorTarget = { kind: 'home' };

type ProductHeroCursorProps = {
  clicking: boolean;
  color: string;
  glideMs?: number;
  hidden: boolean;
  home: Coordinate;
  name: string;
  target?: CursorTarget;
};

export function ProductHeroCursor({
  clicking,
  color,
  glideMs: glideMsOverride,
  hidden,
  home,
  name,
  target = HOME_TARGET,
}: ProductHeroCursorProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [coordinate, setCoordinate] = useState<Coordinate>(home);
  const [glideMs, setGlideMs] = useState(0);
  const coordinateRef = useRef<Coordinate>(home);

  const moveTo = useCallback((next: Coordinate, explicitMs?: number) => {
    const overlayRect = overlayRef.current?.getBoundingClientRect();

    if (!overlayRect) {
      coordinateRef.current = next;
      setCoordinate(next);
      return;
    }

    const distance = pixelDistance(coordinateRef.current, next, overlayRect);

    if (distance < GLIDE_SKIP_PX) {
      return;
    }

    coordinateRef.current = next;
    setGlideMs(explicitMs ?? glideForDistance(distance));
    setCoordinate(next);
  }, []);

  useEffect(() => {
    if (target.kind === 'home') {
      moveTo(home);
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

      moveTo(
        {
          left: (x / overlayRect.width) * 100,
          top: (y / overlayRect.height) * 100,
        },
        glideMsOverride,
      );
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
  }, [target, home, moveTo, glideMsOverride]);

  return (
    <Overlay aria-hidden="true" ref={overlayRef}>
      <Marker
        $clicking={clicking}
        $glideMs={glideMs}
        $hidden={hidden}
        $left={coordinate.left}
        $top={coordinate.top}
      >
        <MarkerCursor color={color} rotation={132} />
        <Label $color={color}>{name}</Label>
      </Marker>
    </Overlay>
  );
}
