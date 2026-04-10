'use client';

import { styled } from '@linaria/react';
import NextImage from 'next/image';
import { useEffect, useRef } from 'react';

const IMAGE_SRC = '/images/home/problem/monolith2.jpg';
const PATTERN_SRC = '/images/home/problem/halftone-pattern.png';

const BASE_SCALE = 1.08;
const HOVER_SCALE = 1.12;
const PATTERN_SCALE = 1.15;
const EASE = 0.12;
const BASE_RANGE_X = 12;
const BASE_RANGE_Y = 10;
const PATTERN_RANGE_X = 18;
const PATTERN_RANGE_Y = 14;
const PATTERN_IDLE_OPACITY = 0.52;
const PATTERN_ACTIVE_OPACITY = 0.72;

type MotionState = {
  baseOffsetX: number;
  baseOffsetY: number;
  baseScale: number;
  glowOpacity: number;
  glowX: number;
  glowY: number;
  patternOffsetX: number;
  patternOffsetY: number;
  patternOpacity: number;
  patternScale: number;
};

const StyledRoot = styled.div`
  --base-offset-x: 0px;
  --base-offset-y: 0px;
  --base-scale: ${BASE_SCALE};
  --pattern-offset-x: 0px;
  --pattern-offset-y: 0px;
  --pattern-opacity: ${PATTERN_IDLE_OPACITY};
  --pattern-scale: ${PATTERN_SCALE};
  --glow-opacity: 0;
  --glow-x: 50%;
  --glow-y: 38%;

  background:
    radial-gradient(
      circle at 50% 22%,
      rgba(255, 255, 255, 0.22) 0%,
      rgba(255, 255, 255, 0) 38%
    ),
    linear-gradient(
      180deg,
      rgba(24, 10, 14, 0.04) 0%,
      rgba(24, 10, 14, 0.02) 42%,
      rgba(24, 10, 14, 0.12) 100%
    );
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledBaseLayer = styled.div`
  inset: -8%;
  position: absolute;
  transform: translate3d(var(--base-offset-x), var(--base-offset-y), 0)
    scale(var(--base-scale));
  transform-origin: center center;
  will-change: transform;
`;

const StyledPatternLayer = styled.div`
  inset: -8%;
  opacity: var(--pattern-opacity);
  pointer-events: none;
  position: absolute;
  transform: translate3d(var(--pattern-offset-x), var(--pattern-offset-y), 0)
    scale(var(--pattern-scale));
  transform-origin: center center;
  will-change: transform, opacity;
`;

const StyledGlow = styled.div`
  background: radial-gradient(
    circle at var(--glow-x) var(--glow-y),
    rgba(255, 255, 255, 0.26) 0%,
    rgba(255, 255, 255, 0.08) 16%,
    rgba(255, 255, 255, 0) 38%
  );
  inset: -16%;
  mix-blend-mode: screen;
  opacity: var(--glow-opacity);
  pointer-events: none;
  position: absolute;
  will-change: opacity;
`;

const StyledShade = styled.div`
  background:
    linear-gradient(
      180deg,
      rgba(18, 7, 10, 0.02) 0%,
      rgba(18, 7, 10, 0.02) 30%,
      rgba(18, 7, 10, 0.16) 100%
    ),
    linear-gradient(
      90deg,
      rgba(18, 7, 10, 0.1) 0%,
      rgba(18, 7, 10, 0) 18%,
      rgba(18, 7, 10, 0) 82%,
      rgba(18, 7, 10, 0.08) 100%
    );
  inset: 0;
  pointer-events: none;
  position: absolute;
`;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function easeValue(current: number, target: number) {
  return current + (target - current) * EASE;
}

function applyMotionStyles(element: HTMLDivElement, state: MotionState) {
  element.style.setProperty(
    '--base-offset-x',
    `${state.baseOffsetX.toFixed(2)}px`,
  );
  element.style.setProperty(
    '--base-offset-y',
    `${state.baseOffsetY.toFixed(2)}px`,
  );
  element.style.setProperty('--base-scale', state.baseScale.toFixed(4));
  element.style.setProperty(
    '--pattern-offset-x',
    `${state.patternOffsetX.toFixed(2)}px`,
  );
  element.style.setProperty(
    '--pattern-offset-y',
    `${state.patternOffsetY.toFixed(2)}px`,
  );
  element.style.setProperty('--pattern-scale', state.patternScale.toFixed(4));
  element.style.setProperty(
    '--pattern-opacity',
    state.patternOpacity.toFixed(4),
  );
  element.style.setProperty('--glow-x', `${state.glowX.toFixed(2)}%`);
  element.style.setProperty('--glow-y', `${state.glowY.toFixed(2)}%`);
  element.style.setProperty('--glow-opacity', state.glowOpacity.toFixed(4));
}

export default function Monolith() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = rootRef.current;

    if (!element) {
      return;
    }

    const current: MotionState = {
      baseOffsetX: 0,
      baseOffsetY: 0,
      baseScale: BASE_SCALE,
      glowOpacity: 0,
      glowX: 50,
      glowY: 38,
      patternOffsetX: 0,
      patternOffsetY: 0,
      patternOpacity: PATTERN_IDLE_OPACITY,
      patternScale: PATTERN_SCALE,
    };

    const target: MotionState = { ...current };
    let frameId = 0;

    const animate = () => {
      current.baseOffsetX = easeValue(current.baseOffsetX, target.baseOffsetX);
      current.baseOffsetY = easeValue(current.baseOffsetY, target.baseOffsetY);
      current.baseScale = easeValue(current.baseScale, target.baseScale);
      current.patternOffsetX = easeValue(
        current.patternOffsetX,
        target.patternOffsetX,
      );
      current.patternOffsetY = easeValue(
        current.patternOffsetY,
        target.patternOffsetY,
      );
      current.patternOpacity = easeValue(
        current.patternOpacity,
        target.patternOpacity,
      );
      current.patternScale = easeValue(
        current.patternScale,
        target.patternScale,
      );
      current.glowX = easeValue(current.glowX, target.glowX);
      current.glowY = easeValue(current.glowY, target.glowY);
      current.glowOpacity = easeValue(current.glowOpacity, target.glowOpacity);

      applyMotionStyles(element, current);
      frameId = window.requestAnimationFrame(animate);
    };

    const updateTargetsFromPointer = (clientX: number, clientY: number) => {
      const rect = element.getBoundingClientRect();
      const normalizedX = clamp(
        (clientX - rect.left) / Math.max(rect.width, 1),
        0,
        1,
      );
      const normalizedY = clamp(
        (clientY - rect.top) / Math.max(rect.height, 1),
        0,
        1,
      );

      target.baseOffsetX = (0.5 - normalizedX) * BASE_RANGE_X;
      target.baseOffsetY = (0.5 - normalizedY) * BASE_RANGE_Y;
      target.baseScale = HOVER_SCALE;
      target.patternOffsetX = (0.5 - normalizedX) * PATTERN_RANGE_X;
      target.patternOffsetY = (0.5 - normalizedY) * PATTERN_RANGE_Y;
      target.patternOpacity = PATTERN_ACTIVE_OPACITY;
      target.patternScale = PATTERN_SCALE + 0.02;
      target.glowX = normalizedX * 100;
      target.glowY = normalizedY * 100;
      target.glowOpacity = 1;
    };

    const resetTargets = () => {
      target.baseOffsetX = 0;
      target.baseOffsetY = 0;
      target.baseScale = BASE_SCALE;
      target.patternOffsetX = 0;
      target.patternOffsetY = 0;
      target.patternOpacity = PATTERN_IDLE_OPACITY;
      target.patternScale = PATTERN_SCALE;
      target.glowX = 50;
      target.glowY = 38;
      target.glowOpacity = 0;
    };

    const handlePointerEnter = (event: PointerEvent) => {
      updateTargetsFromPointer(event.clientX, event.clientY);
    };

    const handlePointerMove = (event: PointerEvent) => {
      updateTargetsFromPointer(event.clientX, event.clientY);
    };

    const handlePointerLeave = () => {
      resetTargets();
    };

    const handleWindowBlur = () => {
      resetTargets();
    };

    element.addEventListener('pointerenter', handlePointerEnter);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('blur', handleWindowBlur);
    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      element.removeEventListener('pointerenter', handlePointerEnter);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  return (
    <StyledRoot ref={rootRef}>
      <StyledBaseLayer>
        <NextImage
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          src={IMAGE_SRC}
          style={{
            objectFit: 'cover',
            objectPosition: 'center center',
          }}
        />
      </StyledBaseLayer>
      <StyledPatternLayer>
        <NextImage
          alt=""
          aria-hidden
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          src={PATTERN_SRC}
          style={{
            objectFit: 'cover',
            objectPosition: 'center center',
          }}
        />
      </StyledPatternLayer>
      <StyledGlow />
      <StyledShade />
    </StyledRoot>
  );
}
