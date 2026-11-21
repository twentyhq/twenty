'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { color, type PaletteToken } from '@/tokens';
import { cssVariableStyle } from '@/ui/css-variable-style';

import { WORLD_LAND_GRID } from './world-land-grid.data';

// Transparent, so the card's own surface and hover fill show through.
const Shell = styled.div`
  --partners-stage-cover-dot: ${color('white')};
  inset: 0;
  position: absolute;
`;

const Canvas = styled.canvas`
  display: block;
  height: 100%;
  width: 100%;
`;

// One scale for every cover, wide or narrow, so the coasts read the same.
const PIXELS_PER_DEGREE = 6;

type PartnersStageRegionCoverProps = {
  accent: PaletteToken;
  center: readonly [number, number];
  hasBase: boolean;
};

export function PartnersStageRegionCover({
  accent,
  center,
  hasBase,
}: PartnersStageRegionCoverProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [centerLongitude, centerLatitude] = center;

  useEffect(() => {
    const shell = shellRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!isDefined(shell) || !isDefined(canvas) || !context) {
      return;
    }

    const { columns, degreesPerCell, northLatitude, rows } = WORLD_LAND_GRID;

    const draw = () => {
      // The custom properties can still be empty on a first paint.
      const styles = getComputedStyle(shell);
      const ink = styles.getPropertyValue('--partners-stage-cover-ink').trim();
      const dot = styles.getPropertyValue('--partners-stage-cover-dot').trim();
      if (ink === '' || dot === '') {
        return;
      }
      const width = shell.clientWidth;
      const height = shell.clientHeight;
      if (width === 0 || height === 0) {
        return;
      }
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const pixelsPerDegree = PIXELS_PER_DEGREE;
      const cell = degreesPerCell * pixelsPerDegree;
      const toX = (longitude: number) =>
        width / 2 + (longitude - centerLongitude) * pixelsPerDegree;
      const toY = (latitude: number) =>
        height / 2 - (latitude - centerLatitude) * pixelsPerDegree;

      context.lineCap = 'round';
      context.lineWidth = Math.max(1.5, cell * 0.18);
      context.strokeStyle = ink;
      context.globalAlpha = 0.5;
      context.beginPath();
      rows.forEach((row, rowIndex) => {
        const y = toY(northLatitude - (rowIndex + 0.5) * degreesPerCell);
        if (y < -cell || y > height + cell) {
          return;
        }
        for (let column = 0; column < columns; column += 1) {
          if (row[column] !== '1') {
            continue;
          }
          let longitude = -180 + (column + 0.5) * degreesPerCell;
          // The cover may straddle the antimeridian.
          if (longitude - centerLongitude > 180) {
            longitude -= 360;
          } else if (centerLongitude - longitude > 180) {
            longitude += 360;
          }
          const x = toX(longitude);
          if (x < -cell || x > width + cell) {
            continue;
          }
          context.moveTo(x - cell * 0.3, y);
          context.lineTo(x + cell * 0.3, y);
        }
      });
      context.stroke();

      if (hasBase) {
        // A flat dot in the accent with a crisp ring: no glow.
        const x = width / 2;
        const y = height / 2;
        const dotRadius = Math.max(3, cell * 0.36);
        context.globalAlpha = 1;
        context.fillStyle = ink;
        context.beginPath();
        context.arc(x, y, dotRadius, 0, Math.PI * 2);
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = dot;
        context.beginPath();
        context.arc(x, y, dotRadius + 3, 0, Math.PI * 2);
        context.stroke();
      }
      context.globalAlpha = 1;
    };

    draw();
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(shell);
    return () => resizeObserver.disconnect();
  }, [centerLongitude, centerLatitude, hasBase, accent]);

  return (
    <Shell
      aria-hidden
      ref={shellRef}
      style={cssVariableStyle({ '--partners-stage-cover-ink': color(accent) })}
    >
      <Canvas ref={canvasRef} />
    </Shell>
  );
}
