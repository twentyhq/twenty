'use client';

import { styled } from '@linaria/react';
import { useCallback, useRef, useState, type ReactNode } from 'react';

import { usePrefersReducedMotion } from '@/lib/motion';

const SWIPE_COMMIT_RATIO = 0.18;
const EDGE_RESISTANCE = 0.28;

const Viewport = styled.div`
  min-height: min(280px, 50dvh);
  overflow: hidden;
  touch-action: pan-x;
  user-select: none;
  width: 100%;
`;

const Track = styled.div<{ $reduceMotion: boolean }>`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  will-change: transform;

  ${({ $reduceMotion }) =>
    $reduceMotion
      ? ''
      : `transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);`}
`;

type StepperSwipeDeckProps = {
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

  const readViewportWidthPx = useCallback(() => {
    const width = viewportRef.current?.getBoundingClientRect().width;
    return typeof width === 'number' && width > 0 ? width : 0;
  }, []);

  const applyEdgeResistance = useCallback(
    (offsetPx: number, fromIndex: number) => {
      if (fromIndex === 0 && offsetPx > 0) {
        return offsetPx * EDGE_RESISTANCE;
      }
      if (fromIndex === stepCount - 1 && offsetPx < 0) {
        return offsetPx * EDGE_RESISTANCE;
      }
      return offsetPx;
    },
    [stepCount],
  );

  const commitDragEnd = useCallback(
    (offsetPx: number, fromIndex: number) => {
      const width = readViewportWidthPx();
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

      if (nextIndex !== fromIndex) {
        onActiveIndexChange(nextIndex);
      }

      setDragOffsetPx(0);
      dragOffsetPxRef.current = 0;
    },
    [onActiveIndexChange, readViewportWidthPx, stepCount],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      pointerIdRef.current = event.pointerId;
      dragStartXRef.current = event.clientX;
      dragStartIndexRef.current = activeIndex;
      setIsDragging(true);
      setDragOffsetPx(0);
      dragOffsetPxRef.current = 0;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [activeIndex],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }

      const rawOffset = event.clientX - dragStartXRef.current;
      const resisted = applyEdgeResistance(
        rawOffset,
        dragStartIndexRef.current,
      );
      dragOffsetPxRef.current = resisted;
      setDragOffsetPx(resisted);
    },
    [applyEdgeResistance],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }

      pointerIdRef.current = null;
      setIsDragging(false);

      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer was not captured
      }

      commitDragEnd(dragOffsetPxRef.current, dragStartIndexRef.current);
    },
    [commitDragEnd],
  );

  const handlePointerCancel = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }

      pointerIdRef.current = null;
      setIsDragging(false);
      setDragOffsetPx(0);
      dragOffsetPxRef.current = 0;

      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer was not captured
      }
    },
    [],
  );

  const slideFlexBasisPercent = 100 / stepCount;
  const translatePercent = (-100 * activeIndex) / stepCount;

  return (
    <Viewport
      ref={viewportRef}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <Track
        $reduceMotion={reduceMotion || isDragging}
        style={{
          transform: `translate3d(calc(${translatePercent}% + ${dragOffsetPx}px), 0, 0)`,
          width: `${stepCount * 100}%`,
        }}
      >
        {Array.from({ length: stepCount }, (_, stepIndex) => (
          <div
            key={stepIndex}
            style={{
              boxSizing: 'border-box',
              flex: `0 0 calc(${slideFlexBasisPercent}%)`,
              maxWidth: '100%',
              minWidth: 0,
            }}
          >
            {children(stepIndex)}
          </div>
        ))}
      </Track>
    </Viewport>
  );
}
