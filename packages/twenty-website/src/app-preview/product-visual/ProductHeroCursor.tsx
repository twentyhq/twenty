'use client';

import { styled } from '@linaria/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { MarkerCursor } from '@/icons';
import { EASING, fontFamily, FONT_WEIGHT } from '@/tokens';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { observeElementSize } from '@/platform/motion';

import { cursorGlide } from './cursor-glide';
import { type CursorTarget } from './cursor-tour-phases';
import { type HeroCursorCoordinate } from './hero-cursors';

const ROW_X_OFFSET_PX = 80;
const ROW_Y_OFFSET_PX = -5;
const RAIL_X_OFFSET_PX = -4;
const RAIL_Y_OFFSET_PX = -4;
const TAB_X_OFFSET_PX = 2;
const TAB_Y_OFFSET_PX = -6;

const CURSOR_LABEL_INK = APP_PREVIEW_TONES.productVisual.cursorLabelInk;

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
    left ${({ $glideMs }) => `${$glideMs}ms`} ${EASING.standard},
    top ${({ $glideMs }) => `${$glideMs}ms`} ${EASING.standard},
    opacity 180ms ease,
    transform 150ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: opacity 180ms ease;
  }
`;

const Label = styled.span<{ $color: string }>`
  background: ${({ $color }) => $color};
  border-radius: 4px;
  color: ${CURSOR_LABEL_INK};
  font-family: ${fontFamily('mono')};
  font-size: 10px;
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.02em;
  line-height: 1;
  padding: 4px 8px;
  text-transform: uppercase;
  width: fit-content;
`;

const HOME_TARGET: CursorTarget = { kind: 'home' };

// One collaborator cursor: glides between its home and measured targets
// (table row, sidebar rail item, record tab) inside the scene overlay.
export function ProductHeroCursor({
  clicking,
  color,
  glideMs: glideMsOverride,
  hidden,
  home,
  name,
  target = HOME_TARGET,
}: {
  clicking: boolean;
  color: string;
  glideMs?: number;
  hidden: boolean;
  home: HeroCursorCoordinate;
  name: string;
  target?: CursorTarget;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [coordinate, setCoordinate] = useState<HeroCursorCoordinate>(home);
  const [glideMs, setGlideMs] = useState(0);
  const coordinateRef = useRef<HeroCursorCoordinate>(home);

  const moveTo = useCallback(
    (next: HeroCursorCoordinate, explicitMs?: number) => {
      const overlayRect = overlayRef.current?.getBoundingClientRect();

      if (!overlayRect) {
        coordinateRef.current = next;
        setCoordinate(next);
        return;
      }

      const distance = cursorGlide.pixelDistance(
        coordinateRef.current,
        next,
        overlayRect,
      );

      if (distance < cursorGlide.SKIP_PX) {
        return;
      }

      coordinateRef.current = next;
      setGlideMs(explicitMs ?? cursorGlide.forDistance(distance));
      setCoordinate(next);
    },
    [],
  );

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

    // Targets shift while the page's appear animations play out; re-measure
    // when those animations actually finish (and on any scene resize)
    // instead of guessing with settle timers.
    const scene = overlayRef.current?.parentElement;
    scene?.addEventListener('animationend', measure);
    const stopObserving = scene ? observeElementSize(scene, measure) : null;

    return () => {
      window.removeEventListener('resize', measure);
      scene?.removeEventListener('animationend', measure);
      stopObserving?.();
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
