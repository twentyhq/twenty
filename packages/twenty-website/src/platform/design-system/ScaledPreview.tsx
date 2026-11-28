'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import {
  DURATION,
  EASING,
  color,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

const Frame = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  overflow: clip;
  position: relative;
`;

const Canvas = styled.div`
  left: 0;
  position: absolute;
  top: 0;
  transform-origin: 0 0;
  transition: transform ${DURATION.md} ${EASING.standard};
`;

const MARK = 'data-preview-focus';

// Elements a styled component renders: Linaria prefixes their class with the
// component's name (Name_hash), in development.
const elementsOf = (root: HTMLElement, styledName: string) =>
  [...root.querySelectorAll<HTMLElement>(`[class*="${styledName}_"]`)].filter(
    (element) =>
      [...element.classList].some((name) => name.startsWith(`${styledName}_`)),
  );

// The real section, rendered at the window's width (so the site's breakpoints
// read the same width they would on the page) and shrunk to fit the column,
// like a thumbnail. Interaction is off: Inspect is for that. `focus` outlines
// the elements of some styled components and pans to the first one.
export function ScaledPreview({
  children,
  focus = [],
  countNames = [],
  onCount,
  maxHeightRatio = 0.75,
}: {
  children: ReactNode;
  focus?: string[];
  countNames?: string[];
  onCount?: (counts: Record<string, number>) => void;
  maxHeightRatio?: number;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, scale: 0, height: 0 });
  const [offset, setOffset] = useState(0);

  // Measuring layout needs the DOM, so it lives in an effect.
  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;
    const update = () => {
      const width = document.documentElement.clientWidth;
      const scale = frame.clientWidth / width;
      setBox({
        width,
        scale,
        height: Math.min(
          canvas.scrollHeight * scale,
          window.innerHeight * maxHeightRatio,
        ),
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [maxHeightRatio]);

  // How many elements each styled component draws here, once drawn.
  const countKey = countNames.join('|');
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !box.scale || !onCount) return;
    onCount(
      Object.fromEntries(
        countKey
          .split('|')
          .filter(Boolean)
          .map((name) => [name, elementsOf(canvas, name).length]),
      ),
    );
  }, [box.scale, countKey, onCount]);

  // Outline the focused elements and pan the thumbnail to the first one.
  const focusKey = focus.join('|');
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !box.scale) return;
    for (const element of canvas.querySelectorAll<HTMLElement>(`[${MARK}]`)) {
      element.style.outline = '';
      element.removeAttribute(MARK);
    }
    const elements = focusKey
      .split('|')
      .filter(Boolean)
      .flatMap((name) => elementsOf(canvas, name));
    for (const element of elements) {
      element.setAttribute(MARK, '');
      element.style.outline = `${spacing(1)} solid ${color('error')}`;
    }
    const first = elements[0];
    if (!first) {
      setOffset(0);
      return;
    }
    const top =
      (first.getBoundingClientRect().top - canvas.getBoundingClientRect().top) /
      box.scale;
    const scaledTop = top * box.scale;
    const maxOffset = canvas.scrollHeight * box.scale - box.height;
    setOffset(
      scaledTop < box.height * 0.6
        ? 0
        : Math.max(0, Math.min(scaledTop - box.height * 0.25, maxOffset)),
    );
  }, [focusKey, box.scale, box.height]);

  return (
    <Frame ref={frameRef} style={{ height: box.height || undefined }}>
      <Canvas
        ref={canvasRef}
        inert
        style={{
          transform: `translateY(${-offset}px) scale(${box.scale || 0})`,
          width: box.width || undefined,
        }}
      >
        {children}
      </Canvas>
    </Frame>
  );
}
