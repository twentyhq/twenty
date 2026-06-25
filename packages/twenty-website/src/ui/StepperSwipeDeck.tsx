'use client';

import { styled } from '@linaria/react';
import { useCallback, useRef, useState, type ReactNode } from 'react';

import { usePrefersReducedMotion } from '@/platform/motion';
import { EASING } from '@/tokens';

const SWIPE_COMMIT_RATIO = 0.18;
const EDGE_RESISTANCE = 0.28;

const Viewport = styled.div`
  min-height: min(280px, 50dvh);
  overflow: hidden;
  touch-action: pan-x;
  user-select: none;
  width: 100%;
`;

const Track = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  transition: transform 0.38s ${EASING.standard};
  will-change: transform;

  &[data-instant] {
    transition: none;
  }
`;

const releasePointer = (event: React.PointerEvent<HTMLDivElement>): void => {
  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId);
  }
};

const Slide = styled.div`
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
`;

export type StepperSwipeDeckProps = {
  activeIndex: number;
  children: (stepIndex: number) => ReactNode;
  onActiveIndexChange: (nextIndex: number) => void;
  stepCount: number;
};

export function StepperSwipeDeck({
  activeIndex,
  children,
  onActiveIndexChange,
  stepCount,
}: StepperSwipeDeckProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetPxRef = useRef(0);
  const dragStartXRef = useRef(0);
  const dragStartIndexRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  const applyEdgeResistance = useCallback(
    (offsetPx: number, fromIndex: number) => {
      if (fromIndex === 0 && offsetPx > 0) return offsetPx * EDGE_RESISTANCE;
      if (fromIndex === stepCount - 1 && offsetPx < 0) {
        return offsetPx * EDGE_RESISTANCE;
      }
      return offsetPx;
    },
    [stepCount],
  );

  const commitDragEnd = useCallback(
    (offsetPx: number, fromIndex: number) => {
      const width = viewportRef.current?.getBoundingClientRect().width ?? 0;
      if (width <= 0) {
        setDragOffsetPx(0);
        dragOffsetPxRef.current = 0;
        return;
      }
      const thresholdPx = width * SWIPE_COMMIT_RATIO;
      let nextIndex = fromIndex;
      if (offsetPx < -thresholdPx && fromIndex < stepCount - 1) {
        nextIndex = fromIndex + 1;
      } else if (offsetPx > thresholdPx && fromIndex > 0) {
        nextIndex = fromIndex - 1;
      }
      if (nextIndex !== fromIndex) onActiveIndexChange(nextIndex);
      setDragOffsetPx(0);
      dragOffsetPxRef.current = 0;
    },
    [onActiveIndexChange, stepCount],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerIdRef.current = event.pointerId;
    dragStartXRef.current = event.clientX;
    dragStartIndexRef.current = activeIndex;
    setIsDragging(true);
    setDragOffsetPx(0);
    dragOffsetPxRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    const resisted = applyEdgeResistance(
      event.clientX - dragStartXRef.current,
      dragStartIndexRef.current,
    );
    dragOffsetPxRef.current = resisted;
    setDragOffsetPx(resisted);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    pointerIdRef.current = null;
    setIsDragging(false);
    releasePointer(event);
    commitDragEnd(dragOffsetPxRef.current, dragStartIndexRef.current);
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    pointerIdRef.current = null;
    setIsDragging(false);
    setDragOffsetPx(0);
    dragOffsetPxRef.current = 0;
    releasePointer(event);
  };

  const slideBasisPercent = 100 / stepCount;
  const translatePercent = (-100 * activeIndex) / stepCount;

  return (
    <Viewport
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      ref={viewportRef}
    >
      <Track
        data-instant={reduceMotion || isDragging ? '' : undefined}
        style={{
          transform: `translate3d(calc(${translatePercent}% + ${dragOffsetPx}px), 0, 0)`,
          width: `${stepCount * 100}%`,
        }}
      >
        {Array.from({ length: stepCount }, (_, stepIndex) => (
          <Slide
            key={stepIndex}
            style={{ flex: `0 0 calc(${slideBasisPercent}%)` }}
          >
            {children(stepIndex)}
          </Slide>
        ))}
      </Track>
    </Viewport>
  );
}
