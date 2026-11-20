'use client';

import { styled } from '@linaria/react';
import { useEffect, useMemo, useRef } from 'react';

import { type ServedGeo } from '@/partners-marketplace/served-geos';
import { color } from '@/tokens';

import { WORLD_LAND_GRID } from './world-land-grid.data';
import { worldRegionOfCell } from './world-region-of-cell';

// PROTOTYPE (?direction=e): the world map's dashes laid on a turning globe,
// drawn on a 2D canvas (three stays in the visuals zones). Regions served by
// the filter light up; one selected region turns to face the viewer. It
// can be dragged round (and tipped a little) and thrown.
const Shell = styled.div`
  --partners-stage-globe-land: ${color('white-40')};
  --partners-stage-globe-lit: ${color('green')};
  --partners-stage-globe-dot: ${color('white')};
  aspect-ratio: 1;
  margin-inline: auto;
  max-width: 640px;
  position: relative;
  width: 100%;
`;

// Horizontal drags turn the globe; vertical ones still scroll the page.
const Canvas = styled.canvas`
  cursor: grab;
  display: block;
  height: 100%;
  touch-action: pan-y;
  width: 100%;

  &[data-dragging] {
    cursor: grabbing;
  }
`;

const DEGREES = Math.PI / 180;
const START_TILT_DEGREES = 18;
const TILT_RANGE_DEGREES: readonly [number, number] = [-10, 45];
const INERTIA_DECAY_PER_SECOND = 3;
// The city glows step back while the globe is handled: out fast, back slowly
// once it turns at its own pace again.
const GLOW_FADE_OUT_SECONDS = 0.18;
const GLOW_FADE_IN_SECONDS = 0.7;
const SPIN_DEGREES_PER_SECOND = 7;
// The home hero's hover light (home-hero/hero-backdrop-config), redrawn on
// the globe's dashes: brighter and a little thicker under the pointer, which
// it follows with a slight lag. Mouse only, off under reduced motion.
const LIGHT = {
  follow: 0.38,
  intensity: 0.8,
  radius: 0.14,
  fadeIn: 18,
  fadeOut: 7,
  thicken: 0.6,
} as const;
const DASH_HALF_DEGREES = 0.7;
// Where each region faces the viewer, as the globe's turn.
const REGION_LONGITUDE: Record<ServedGeo, number> = {
  EUROPE: 12,
  US: -98,
  LATAM: -62,
  MENA: 40,
  APAC: 118,
  AFRICA: 20,
};

type LandCell = {
  longitude: number;
  latitude: number;
  halfSpan: number;
  region: ServedGeo | null;
};

// Meridians close in towards the poles: keeping every column there packs the
// dashes into solid bright rings. One column in `step` keeps the weave even.
const LAND_CELLS: readonly LandCell[] = (() => {
  const { degreesPerCell, northLatitude, rows } = WORLD_LAND_GRID;
  const cells: LandCell[] = [];
  rows.forEach((row, rowIndex) => {
    const latitude = northLatitude - (rowIndex + 0.5) * degreesPerCell;
    const step = Math.max(1, Math.round(1 / Math.cos(latitude * DEGREES)));
    for (let columnIndex = 0; columnIndex < row.length; columnIndex += step) {
      if (row[columnIndex] === '1') {
        const longitude = -180 + (columnIndex + 0.5) * degreesPerCell;
        cells.push({
          longitude,
          latitude,
          halfSpan: DASH_HALF_DEGREES * step,
          region: worldRegionOfCell(longitude, latitude),
        });
      }
    }
  });
  return cells;
})();

export type PartnersStageGlobeCity = {
  slug: string;
  coordinates: readonly [number, number];
  isLit: boolean;
};

type PartnersStageGlobeProps = {
  cities: readonly PartnersStageGlobeCity[];
  litRegions: ReadonlySet<ServedGeo>;
};

export function PartnersStageGlobe({
  cities,
  litRegions,
}: PartnersStageGlobeProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Read by the loop on every frame, so a filter change never restarts it.
  const sceneRef = useRef({ cities, litRegions });
  sceneRef.current = { cities, litRegions };

  const focusLongitude = useMemo(() => {
    if (litRegions.size !== 1) {
      return null;
    }
    const [region] = litRegions;
    return REGION_LONGITUDE[region];
  }, [litRegions]);
  const focusRef = useRef<number | null>(focusLongitude);
  focusRef.current = focusLongitude;

  useEffect(() => {
    const shell = shellRef.current;
    const canvas = canvasRef.current;
    if (shell === null || canvas === null) {
      return;
    }
    const context = canvas.getContext('2d');
    if (context === null) {
      return;
    }

    // Read again until the stylesheet has landed: on a first paint (or a
    // hot reload) the custom properties can still be empty.
    const readColors = () => {
      const styles = getComputedStyle(shell);
      const read = (name: string) => styles.getPropertyValue(name).trim();
      return {
        land: read('--partners-stage-globe-land'),
        lit: read('--partners-stage-globe-lit'),
        dot: read('--partners-stage-globe-dot'),
      };
    };
    let colors = readColors();
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let size = 0;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      size = canvas.clientWidth;
      canvas.width = Math.round(size * ratio);
      canvas.height = Math.round(size * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    // Without the loop, a resize (or the first layout) needs its own frame.
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reducedMotion) {
        redraw();
      }
    });
    resizeObserver.observe(canvas);

    let tilt = START_TILT_DEGREES * DEGREES;

    // Orthographic projection of a longitude/latitude, the globe turned by
    // `spin` and tipped towards the viewer by `tilt`.
    const project = (longitude: number, latitude: number, spin: number) => {
      const lambda = (longitude + spin) * DEGREES;
      const phi = latitude * DEGREES;
      const x = Math.cos(phi) * Math.sin(lambda);
      const y =
        Math.sin(phi) * Math.cos(tilt) -
        Math.cos(phi) * Math.cos(lambda) * Math.sin(tilt);
      const z =
        Math.cos(phi) * Math.cos(lambda) * Math.cos(tilt) +
        Math.sin(phi) * Math.sin(tilt);
      return { x, y, z };
    };

    // Pointer light, in canvas pixels; level 0 = off, 1 = full.
    const light = { x: 0, y: 0, targetX: 0, targetY: 0, level: 0, wanted: 0 };
    const canHover =
      !reducedMotion &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    let spin = -20;
    // 0 = no halo, 1 = full halo.
    let glowLevel = 1;
    let last = performance.now();
    let frame = 0;
    let isVisible = true;

    const draw = () => {
      if (colors.lit === '') {
        colors = readColors();
        if (colors.lit === '') {
          return;
        }
      }
      const { cities: currentCities, litRegions: currentLit } =
        sceneRef.current;
      const radius = size * 0.46;
      const center = size / 2;
      context.clearRect(0, 0, size, size);

      // Dashes fade with depth in fine bands, each stroked once per colour: three
      // coarse bands drew their edges as visible rings. Edge-on rows pile up at
      // the rim into a bright ring, so the faintest band starts at 0.15.
      const BAND_COUNT = 16;
      const bands = Array.from({ length: BAND_COUNT }, (_, index) => {
        const progress = index / (BAND_COUNT - 1);
        return {
          minimum: 0.15 + progress * 0.7,
          alpha: 0.2 + 0.8 * progress * progress * (3 - 2 * progress),
        };
      });
      context.lineWidth = Math.max(1, size / 420);
      context.lineCap = 'round';
      for (const tone of ['rest', 'lit'] as const) {
        for (let band = 0; band < bands.length; band += 1) {
          const upper = bands[band + 1]?.minimum ?? 2;
          context.beginPath();
          for (const cell of LAND_CELLS) {
            const isLit =
              currentLit.size > 0 &&
              cell.region !== null &&
              currentLit.has(cell.region);
            if ((tone === 'lit') !== isLit) {
              continue;
            }
            const start = project(
              cell.longitude - cell.halfSpan,
              cell.latitude,
              spin,
            );
            if (start.z < bands[band].minimum || start.z >= upper) {
              continue;
            }
            const end = project(
              cell.longitude + cell.halfSpan,
              cell.latitude,
              spin,
            );
            context.moveTo(
              center + radius * start.x,
              center - radius * start.y,
            );
            context.lineTo(center + radius * end.x, center - radius * end.y);
          }
          const dim = tone === 'rest' && currentLit.size > 0 ? 0.45 : 1;
          context.globalAlpha = bands[band].alpha * dim;
          context.strokeStyle = tone === 'lit' ? colors.lit : colors.land;
          context.stroke();
        }
      }

      if (light.level > 0.01) {
        // Strengths bucketed so each bucket is one stroke.
        const BUCKETS = 4;
        const lightRadius = size * LIGHT.radius;
        const paths = Array.from({ length: BUCKETS }, () => new Path2D());
        for (const cell of LAND_CELLS) {
          const start = project(
            cell.longitude - cell.halfSpan,
            cell.latitude,
            spin,
          );
          if (start.z < 0.15) {
            continue;
          }
          const end = project(
            cell.longitude + cell.halfSpan,
            cell.latitude,
            spin,
          );
          const startX = center + radius * start.x;
          const startY = center - radius * start.y;
          const endX = center + radius * end.x;
          const endY = center - radius * end.y;
          const distance = Math.hypot(
            (startX + endX) / 2 - light.x,
            (startY + endY) / 2 - light.y,
          );
          if (distance >= lightRadius) {
            continue;
          }
          const strength = (1 - distance / lightRadius) ** 2;
          const bucket = Math.min(BUCKETS - 1, Math.floor(strength * BUCKETS));
          paths[bucket].moveTo(startX, startY);
          paths[bucket].lineTo(endX, endY);
        }
        const baseWidth = Math.max(1, size / 420);
        paths.forEach((path, bucket) => {
          const strength = (bucket + 1) / BUCKETS;
          context.globalAlpha = strength * LIGHT.intensity * light.level;
          context.lineWidth = baseWidth * (1 + LIGHT.thicken * strength);
          context.strokeStyle = colors.dot;
          context.stroke(path);
        });
      }

      // Cities, as on the cards: a flat dot in the accent and a crisp ring,
      // no glow. The ring steps back while the globe is handled.
      const dotRadius = Math.max(2.5, (size / 640) * 3.5);
      for (const city of currentCities) {
        const point = project(city.coordinates[0], city.coordinates[1], spin);
        if (point.z <= 0.05) {
          continue;
        }
        const x = center + radius * point.x;
        const y = center - radius * point.y;
        const depth = Math.min(1, point.z * 1.6);
        context.globalAlpha = (city.isLit ? 1 : 0.45) * depth;
        context.fillStyle = colors.lit;
        context.beginPath();
        context.arc(x, y, dotRadius, 0, Math.PI * 2);
        context.fill();
        if (city.isLit && glowLevel > 0.01) {
          context.globalAlpha = depth * glowLevel;
          context.lineWidth = 1;
          context.strokeStyle = colors.dot;
          context.beginPath();
          context.arc(x, y, dotRadius + 3, 0, Math.PI * 2);
          context.stroke();
        }
      }
      context.globalAlpha = 1;
    };

    // Drag state: the hand overrides the spin and the region focus; on
    // release the throw decays, then the slow spin takes over again.
    let isDragging = false;
    let dragX = 0;
    let dragY = 0;
    let dragTime = 0;
    let throwVelocity = 0;
    let ignoredFocus: number | null = null;

    const degreesPerPixel = () => 180 / (Math.PI * size * 0.46);

    const handlePointerDown = (event: PointerEvent) => {
      isDragging = true;
      dragX = event.clientX;
      dragY = event.clientY;
      dragTime = event.timeStamp;
      throwVelocity = 0;
      ignoredFocus = focusRef.current;
      canvas.setPointerCapture(event.pointerId);
      canvas.dataset.dragging = '';
      if (reducedMotion) {
        glowLevel = 0;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) {
        return;
      }
      const deltaX = event.clientX - dragX;
      const deltaY = event.clientY - dragY;
      const deltaTime = Math.max(1, event.timeStamp - dragTime) / 1000;
      dragX = event.clientX;
      dragY = event.clientY;
      dragTime = event.timeStamp;
      const turn = deltaX * degreesPerPixel();
      spin += turn;
      throwVelocity = turn / deltaTime;
      tilt = Math.min(
        TILT_RANGE_DEGREES[1] * DEGREES,
        Math.max(
          TILT_RANGE_DEGREES[0] * DEGREES,
          tilt + deltaY * degreesPerPixel() * DEGREES,
        ),
      );
      if (reducedMotion) {
        draw();
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      isDragging = false;
      delete canvas.dataset.dragging;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      if (reducedMotion) {
        throwVelocity = 0;
        glowLevel = 1;
        draw();
      }
    };

    const handleWindowPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') {
        return;
      }
      const bounds = canvas.getBoundingClientRect();
      light.targetX = event.clientX - bounds.left;
      light.targetY = event.clientY - bounds.top;
      const margin = size * LIGHT.radius;
      const isNear =
        light.targetX > -margin &&
        light.targetY > -margin &&
        light.targetX < bounds.width + margin &&
        light.targetY < bounds.height + margin;
      if (isNear && light.level < 0.01) {
        light.x = light.targetX;
        light.y = light.targetY;
      }
      light.wanted = isNear ? 1 : 0;
    };
    const handleWindowLeave = () => {
      light.wanted = 0;
    };
    if (canHover) {
      window.addEventListener('pointermove', handleWindowPointerMove, {
        passive: true,
      });
      document.documentElement.addEventListener(
        'pointerleave',
        handleWindowLeave,
      );
    }

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    const tick = (now: number) => {
      const elapsed = Math.min(0.1, (now - last) / 1000);
      last = now;
      // A drag sets the region focus aside until the filter changes.
      const focus = focusRef.current === ignoredFocus ? null : focusRef.current;
      if (focusRef.current !== ignoredFocus) {
        ignoredFocus = null;
      }
      if (isDragging) {
        // The pointer moves the globe; nothing else does.
      } else if (Math.abs(throwVelocity) > SPIN_DEGREES_PER_SECOND) {
        spin += throwVelocity * elapsed;
        throwVelocity *= Math.exp(-INERTIA_DECAY_PER_SECOND * elapsed);
      } else if (focus === null) {
        spin += SPIN_DEGREES_PER_SECOND * elapsed;
      } else {
        // Ease the region to the front by the shortest way round.
        const target = -focus;
        const delta = ((((target - spin) % 360) + 540) % 360) - 180;
        spin += delta * Math.min(1, elapsed * 2.5);
      }
      const isHandled =
        isDragging || Math.abs(throwVelocity) > SPIN_DEGREES_PER_SECOND;
      const fadeSeconds = isHandled
        ? GLOW_FADE_OUT_SECONDS
        : GLOW_FADE_IN_SECONDS;
      const step = Math.min(1, elapsed / fadeSeconds);
      glowLevel += ((isHandled ? 0 : 1) - glowLevel) * step;
      // Follow with the home's lag (per 60fps frame), fade in fast, out slow;
      // the hand turning the globe puts the light out.
      const followStep = 1 - (1 - LIGHT.follow) ** (elapsed * 60);
      light.x += (light.targetX - light.x) * followStep;
      light.y += (light.targetY - light.y) * followStep;
      const lightTarget = isDragging ? 0 : light.wanted;
      const lightRate =
        lightTarget > light.level ? LIGHT.fadeIn : LIGHT.fadeOut;
      light.level +=
        (lightTarget - light.level) * Math.min(1, elapsed * lightRate);
      draw();
      frame = isVisible ? requestAnimationFrame(tick) : 0;
    };

    // A globe nobody sees should not keep a frame loop busy.
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && frame === 0 && !reducedMotion) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    });
    intersectionObserver.observe(canvas);

    // Reduced motion: still frames only, redrawn when the filter moves.
    function redraw() {
      if (focusRef.current !== null) {
        spin = -focusRef.current;
      }
      draw();
    }
    canvas.addEventListener('partners-stage-redraw', redraw);

    if (reducedMotion) {
      redraw();
    } else {
      frame = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener('partners-stage-redraw', redraw);
      window.removeEventListener('pointermove', handleWindowPointerMove);
      document.documentElement.removeEventListener(
        'pointerleave',
        handleWindowLeave,
      );
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvasRef.current?.dispatchEvent(new Event('partners-stage-redraw'));
    }
  }, [cities, litRegions]);

  return (
    <Shell ref={shellRef}>
      <Canvas aria-hidden ref={canvasRef} />
    </Shell>
  );
}
