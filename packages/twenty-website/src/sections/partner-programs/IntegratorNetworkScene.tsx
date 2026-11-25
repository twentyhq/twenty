'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import {
  IconApi,
  IconChartBar,
  IconDatabase,
  IconMail,
  IconShieldLock,
  IconSitemap,
  IconTransfer,
  type Icon,
} from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { isDefined } from 'twenty-shared/utils';

import { useMenuStyleWriter } from '@/platform/menu-style';

import {
  createHalftoneDotStage,
  createHalftoneToneMaterial,
} from '@/platform/visuals/halftone-dots/create-halftone-dot-stage';
import {
  SceneOverlay,
  TagDetail,
  TagName,
} from '@/platform/visuals/halftone-dots/halftone-dot-scene-parts';
import {
  color,
  MENU_HEIGHT_PX,
  paletteColorNumber,
  semanticColor,
} from '@/tokens';

// The integrators hero: a blueprint of an integrator's work. A grid of
// tiles, each with a figure drawn in fine lines and filled with the home's
// halftone; the pieces of work a client pays for sit on the grid's crossings
// and run along the lines to the money at the centre, the integrator's 20%,
// which climbs and grows with each one (a seat at $39, so $7.80 a month).
const TILE = 2.7;
// The network sits where the other heroes' banner does (its height, the
// same scale); the grid carries on above it, behind the copy.
const BANNER_UNITS = { wide: 8, narrow: 7.6 };
const bannerPx = (width: number) => Math.min(Math.max(0.36 * width, 202), 396);
const FOV = 28;

// In tiles from the centre; the outer ones only show on wide screens.
const WORK: readonly {
  name: string;
  icon: Icon;
  at: readonly [number, number];
}[] = [
  { name: 'data-model', icon: IconDatabase, at: [-2, 1] },
  { name: 'permissions', icon: IconShieldLock, at: [2, -1] },
  { name: 'migration', icon: IconTransfer, at: [-2, -1] },
  { name: 'workflows', icon: IconSitemap, at: [2, 1] },
  { name: 'dashboards', icon: IconChartBar, at: [-5, 1] },
  { name: 'api', icon: IconApi, at: [5, -1] },
  { name: 'emails', icon: IconMail, at: [5, 1] },
];
const SHARE_PER_SEAT_USD = 39 * 0.2;
// The Earnings step's example: 75 seats make $585 a month, then it starts over.
const SEATS_PER_ROUND = 75;

const USD = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
});

const PACKET_SPEED = 2.4; // units per second
const PACKET_EVERY_MS = 4200;
const ARRIVAL_MS = 600;
// On load the blueprint draws itself from the centre out, as Stripe's does:
// each line is traced and each fill's dots come up once the wave reaches it,
// then the work starts flowing.
const INTRO = { msPerUnit: 60, drawMs: 400, flowAfterMs: 1000 };
const SEGMENT_UNITS = 0.3;
// The data running through a route: a short bright stretch of the line,
// its head full blue, its tail fading into the route's own tint.
const PULSE = { length: 1.6, points: 16, width: 2.6 };
// Decelerating, close to the site's default cubic-bezier(0.16, 1, 0.3, 1).
const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 4);
// Along a route: leaves gently and settles into the money (smootherstep).
const glide = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

// The figure drawn in a tile, picked from its place so the pattern is stable.
type Figure = 'circle' | 'square' | 'diamond' | 'arcs' | 'diagonals' | 'none';
const FIGURES: readonly Figure[] = [
  'circle',
  'none',
  'square',
  'arcs',
  'diamond',
  'none',
  'diagonals',
  'circle',
  'none',
  'square',
];
const figureAt = (column: number, row: number): Figure =>
  FIGURES[Math.abs((column * 7 + row * 3 + column * row) % FIGURES.length)];

const circlePoints = (
  cx: number,
  cy: number,
  r: number,
  from = 0,
  to = Math.PI * 2,
  steps = 64,
) =>
  Array.from({ length: steps + 1 }, (_, index) => {
    const angle = from + ((to - from) * index) / steps;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;
  });

const LogoNode = styled.div`
  background-color: ${color('white')};
  border: 1px solid color-mix(in srgb, ${semanticColor.ink} 12%, transparent);
  border-radius: 50%;
  display: none;
  height: 44px;
  left: 0;
  opacity: var(--o, 1);
  position: absolute;
  top: 0;
  transform: translate(var(--x), var(--y)) translate(-50%, -50%)
    scale(var(--s, 1));
  width: 44px;

  svg {
    color: ${semanticColor.ink};
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  &[data-hub] {
    background-color: ${color('blue')};
    border-color: ${color('blue')};
    height: 80px;
    width: 80px;
  }
`;

// The month's total, written in the money itself, with its period under it.
const HubAmount = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  white-space: nowrap;
`;

const HubValue = styled(TagName)`
  color: ${color('white')};
`;

const HubPeriod = styled(TagDetail)`
  color: color-mix(in srgb, ${color('white')} 72%, transparent);
`;

// The hero's backdrop: the pattern fills it, light under the menu and behind
// the copy, fading out at the sides.
const Backdrop = styled.div`
  inset: 0;
  mask-composite: intersect;
  mask-image:
    radial-gradient(
      ellipse 42% 34% at 50% 26%,
      rgb(0 0 0 / 14%) 45%,
      black 100%
    ),
    linear-gradient(to right, transparent, black 12%, black 88%, transparent),
    linear-gradient(
      to bottom,
      rgb(0 0 0 / 25%) ${MENU_HEIGHT_PX}px,
      black ${MENU_HEIGHT_PX * 2.5}px
    );
  position: absolute;

  canvas {
    display: block;
    height: 100%;
    inset: 0;
    position: absolute;
    width: 100%;
  }
`;

export function IntegratorNetworkScene() {
  const { i18n } = useLingui();
  const frameRef = useRef<HTMLDivElement>(null);
  const totalValueRef = useRef<HTMLSpanElement>(null);
  const toolRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hubRef = useRef<HTMLDivElement>(null);
  const setMenuBackground = useMenuStyleWriter()?.setBackground;

  // The pattern runs up under the menu: the menu lets it show at the top of
  // the page and takes its surface back over the first scroll.
  useEffect(() => {
    if (!isDefined(setMenuBackground)) return;
    const update = () => {
      const opaque = Math.min(Math.max(window.scrollY / MENU_HEIGHT_PX, 0), 1);
      setMenuBackground(
        `color-mix(in srgb, ${semanticColor.surface} ${Math.round(opaque * 100)}%, transparent)`,
      );
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      setMenuBackground(null);
    };
  }, [setMenuBackground]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!isDefined(frame)) return;
    const stage = createHalftoneDotStage(frame, { fov: FOV });
    if (!isDefined(stage)) return;
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const BLUE = paletteColorNumber('blue');
    const halfFov = Math.tan((FOV / 2) * (Math.PI / 180));

    const lines: LineMaterial[] = [];
    // what the load animation brings in, each at the time the wave from the
    // centre reaches it
    const reveals: { delay: number; show: (progress: number) => void }[] = [];
    const delayAt = (x: number, y: number) =>
      Math.hypot(x, y) * INTRO.msPerUnit;
    const addLine = (
      corners: readonly (readonly [number, number])[],
      opacity: number,
      width = 1,
    ) => {
      // cut into short segments so a line can be traced a piece at a time
      const points = corners.flatMap(([x, y], index) => {
        if (index === 0) return [[x, y] as const];
        const [fromX, fromY] = corners[index - 1];
        const steps = Math.max(
          1,
          Math.ceil(Math.hypot(x - fromX, y - fromY) / SEGMENT_UNITS),
        );
        return Array.from({ length: steps }, (_, step) => {
          const t = (step + 1) / steps;
          return [fromX + (x - fromX) * t, fromY + (y - fromY) * t] as const;
        });
      });
      const geometry = new LineGeometry();
      geometry.setPositions(points.flatMap(([x, y]) => [x, y, 0]));
      const segments = points.length - 1;
      const nearest = points.reduce(
        (closest, [x, y]) => Math.min(closest, delayAt(x, y)),
        Infinity,
      );
      if (!reducedMotion) {
        geometry.instanceCount = 0;
        reveals.push({
          delay: nearest,
          show: (progress) => {
            geometry.instanceCount = Math.ceil(segments * progress);
          },
        });
      }
      const material = new LineMaterial({
        color: BLUE,
        linewidth: width,
        opacity,
        resolution: stage.lineResolution,
        transparent: true,
      });
      lines.push(material);
      const line = new Line2(geometry, material);
      stage.crisp.add(line);
      return line;
    };
    const fill = (
      geometry: THREE.BufferGeometry,
      x: number,
      y: number,
      tone = 0.62,
    ) => {
      const material = createHalftoneToneMaterial(tone, 0);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, -0.01);
      stage.tone.add(mesh);
      if (!reducedMotion) {
        // from the field's invisible tone up to its own
        material.uniforms.uBase.value = 0.4;
        reveals.push({
          delay: delayAt(x, y) + INTRO.drawMs / 2,
          show: (progress) => {
            material.uniforms.uBase.value = 0.4 + (tone - 0.4) * progress;
          },
        });
      }
      return mesh;
    };

    // A field of dots too faint to show at rest: the cursor's lift brings
    // them up around it, so the whole grid answers the pointer.
    const field = new THREE.Mesh(
      new THREE.PlaneGeometry(TILE * 40, TILE * 20),
      createHalftoneToneMaterial(0.4, 0),
    );
    field.position.set(0, TILE * 2, -0.02);
    stage.tone.add(field);

    // The backdrop lets clicks through to the copy, so the hero itself
    // hands the pointer to the stage.
    const hero = frame.closest('section') ?? frame.parentElement;
    const forward = (event: PointerEvent) =>
      frame.dispatchEvent(
        new PointerEvent(event.type, {
          clientX: event.clientX,
          clientY: event.clientY,
        }),
      );
    hero?.addEventListener('pointermove', forward);
    hero?.addEventListener('pointerleave', forward);

    // the grid, wide enough for any banner; the camera shows what fits
    const COLUMNS = 8;
    const ROWS_BELOW = 2;
    const ROWS_ABOVE = 6;
    for (let column = -COLUMNS; column <= COLUMNS; column += 1) {
      addLine(
        [
          [column * TILE, -(ROWS_BELOW + 0.5) * TILE],
          [column * TILE, (ROWS_ABOVE + 0.5) * TILE],
        ],
        0.16,
      );
    }
    for (let row = -ROWS_BELOW; row <= ROWS_ABOVE; row += 1) {
      addLine(
        [
          [-(COLUMNS + 0.5) * TILE, row * TILE],
          [(COLUMNS + 0.5) * TILE, row * TILE],
        ],
        0.16,
      );
    }

    for (let column = -COLUMNS; column < COLUMNS; column += 1) {
      for (let row = -ROWS_BELOW - 1; row < ROWS_ABOVE; row += 1) {
        const left = column * TILE;
        const bottom = row * TILE;
        const cx = left + TILE / 2;
        const cy = bottom + TILE / 2;
        const aroundIntegrator =
          column >= -1 && column <= 0 && row >= -1 && row <= 0;
        const figure = aroundIntegrator ? 'none' : figureAt(column, row);
        const filled = (column + row) % 2 === 0;
        if (figure === 'circle') {
          const r = TILE * 0.36;
          addLine(circlePoints(cx, cy, r), 0.34);
          if (filled) fill(new THREE.CircleGeometry(r, 48), cx, cy);
        } else if (figure === 'square') {
          const half = TILE * 0.24;
          addLine(
            [
              [cx - half, cy - half],
              [cx + half, cy - half],
              [cx + half, cy + half],
              [cx - half, cy + half],
              [cx - half, cy - half],
            ],
            0.34,
          );
          addLine(
            [
              [cx, cy + half],
              [cx, bottom + TILE],
            ],
            0.24,
          );
          if (filled) fill(new THREE.PlaneGeometry(half * 2, half * 2), cx, cy);
        } else if (figure === 'diamond') {
          const half = TILE * 0.26;
          const points = [
            [cx, cy - half],
            [cx + half, cy],
            [cx, cy + half],
            [cx - half, cy],
            [cx, cy - half],
          ] as const;
          addLine(points, 0.34);
          if (filled) {
            const shape = new THREE.Shape();
            points.forEach(([x, y], index) =>
              index === 0
                ? shape.moveTo(x - cx, y - cy)
                : shape.lineTo(x - cx, y - cy),
            );
            fill(new THREE.ShapeGeometry(shape), cx, cy);
          }
        } else if (figure === 'arcs') {
          [0.35, 0.6, 0.85].forEach((share) =>
            addLine(
              circlePoints(left, bottom, TILE * share, 0, Math.PI / 2, 24),
              0.28,
            ),
          );
        } else if (figure === 'diagonals') {
          [0.2, 0.4, 0.6].forEach((share) =>
            addLine(
              [
                [left + TILE * share, bottom],
                [left + TILE, bottom + TILE * (1 - share)],
              ],
              0.26,
            ),
          );
        }
      }
    }

    // the money's ring of halftone, and the routes into it: along their
    // row to the centre column, then down or up to the centre
    const hubRadius = TILE * 0.62;
    const hubRing = [
      fill(new THREE.RingGeometry(hubRadius * 0.55, hubRadius, 64), 0, 0),
      addLine(circlePoints(0, 0, hubRadius), 0.5),
    ];

    const routes = WORK.map((tool) => {
      const x = tool.at[0] * TILE;
      const y = tool.at[1] * TILE;
      const corner: [number, number] = [0, y];
      const points: [number, number][] = [[x, y], corner, [0, 0]];
      addLine(points, 0.6, 1.4);
      const segments = points.slice(1).map((point, index) => {
        const start = new THREE.Vector2(...points[index]);
        const end = new THREE.Vector2(...point);
        return { start, end, length: start.distanceTo(end) };
      });
      const length = segments.reduce(
        (total, segment) => total + segment.length,
        0,
      );
      return { segments, length };
    });
    const pointOn = (route: (typeof routes)[number], distance: number) => {
      let left = distance;
      for (const segment of route.segments) {
        if (left <= segment.length) {
          return segment.start.clone().lerp(segment.end, left / segment.length);
        }
        left -= segment.length;
      }
      return new THREE.Vector2(0, 0);
    };

    // one pulse of data per route, its segments rewritten each frame
    const tint = new THREE.Color(BLUE).lerp(new THREE.Color(0xffffff), 0.45);
    const head = new THREE.Color(BLUE);
    const dataPulses = routes.map(() => {
      const geometry = new LineGeometry();
      geometry.setPositions(new Float32Array(PULSE.points * 3));
      geometry.setColors(
        Array.from({ length: PULSE.points }, (_, index) => {
          const share = index / (PULSE.points - 1);
          const shade = tint.clone().lerp(head, share * share);
          return [shade.r, shade.g, shade.b];
        }).flat(),
      );
      const material = new LineMaterial({
        color: 0xffffff,
        linewidth: PULSE.width,
        resolution: stage.lineResolution,
        vertexColors: true,
      });
      lines.push(material);
      const line = new Line2(geometry, material);
      line.frustumCulled = false;
      line.visible = false;
      line.position.z = 0.01;
      stage.crisp.add(line);
      const buffer = geometry.getAttribute(
        'instanceStart',
      ) as THREE.InterleavedBufferAttribute;
      return { line, segments: buffer.data };
    });
    const sample = new THREE.Vector2();
    // lays the pulse's points from its tail to its head along the route
    const drawPulse = (
      dataPulse: (typeof dataPulses)[number],
      route: (typeof routes)[number],
      headAt: number,
    ) => {
      const array = dataPulse.segments.array as Float32Array;
      const tailAt = headAt - PULSE.length;
      let previousX = 0;
      let previousY = 0;
      for (let index = 0; index < PULSE.points; index += 1) {
        const at = tailAt + (PULSE.length * index) / (PULSE.points - 1);
        sample.copy(pointOn(route, Math.min(Math.max(at, 0), route.length)));
        if (index > 0) {
          const offset = (index - 1) * 6;
          array[offset] = previousX;
          array[offset + 1] = previousY;
          array[offset + 2] = 0;
          array[offset + 3] = sample.x;
          array[offset + 4] = sample.y;
          array[offset + 5] = 0;
        }
        previousX = sample.x;
        previousY = sample.y;
      }
      dataPulse.segments.needsUpdate = true;
    };

    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: BLUE,
      opacity: 0,
      transparent: true,
    });
    const pulse = new THREE.Mesh(
      new THREE.RingGeometry(hubRadius - 0.02, hubRadius + 0.02, 96),
      pulseMaterial,
    );
    stage.crisp.add(pulse);

    const anchor = new THREE.Vector3();
    let startedAt = -1;
    let shownTotal = 0;
    let animationFrame = 0;

    const render = (now: number) => {
      animationFrame = requestAnimationFrame(render);
      if (!stage.isVisible()) return;
      if (startedAt < 0) startedAt = now;
      const sinceLoad = now - startedAt;
      const elapsed = reducedMotion
        ? 0
        : Math.max(sinceLoad - INTRO.flowAfterMs, 0);
      if (reveals.length > 0) {
        for (let index = reveals.length - 1; index >= 0; index -= 1) {
          const reveal = reveals[index];
          const progress = ease((sinceLoad - reveal.delay) / INTRO.drawMs);
          reveal.show(progress);
          if (progress >= 1) reveals.splice(index, 1);
        }
      }
      const arrive = (x: number, y: number) =>
        reducedMotion ? 1 : ease((sinceLoad - delayAt(x, y)) / INTRO.drawMs);

      // a flat drawing seen straight on; the money sits mid-banner, at
      // the bottom of the hero, and the grid fills the rest of its height
      const width = Math.max(frame.clientWidth, 1);
      const units = width < 768 ? BANNER_UNITS.narrow : BANNER_UNITS.wide;
      const pxPerUnit = bannerPx(width) / units;
      const viewHeight = Math.max(frame.clientHeight, 1) / pxPerUnit;
      const lookY = viewHeight / 2 - units / 2;
      stage.camera.position.set(0, lookY, viewHeight / 2 / halfFov);
      stage.camera.lookAt(0, lookY, 0);

      // each piece of work reaches the centre in turn; the ring answers
      let lastArrival = Infinity;
      let seats = 0;
      routes.forEach((route, index) => {
        const dataPulse = dataPulses[index];
        if (reducedMotion) return;
        // the head runs on past the end until the tail is in the money too
        const runLength = route.length + PULSE.length;
        const travelMs = (runLength / PACKET_SPEED) * 1000;
        const arriveMs = (route.length / PACKET_SPEED) * 1000;
        const offset = (index * PACKET_EVERY_MS) / routes.length;
        if (elapsed >= offset + arriveMs) {
          seats +=
            Math.floor((elapsed - offset - arriveMs) / PACKET_EVERY_MS) + 1;
        }
        const local = (elapsed - offset) % PACKET_EVERY_MS;
        if (elapsed >= offset + arriveMs && local >= arriveMs) {
          lastArrival = Math.min(lastArrival, local - arriveMs);
        }
        if (elapsed < offset || local > travelMs) {
          dataPulse.line.visible = false;
          return;
        }
        // eased: it sets off gently and settles as it reaches the money
        dataPulse.line.visible = true;
        drawPulse(dataPulse, route, runLength * glide(local / travelMs));
      });
      const pulseAge = lastArrival / ARRIVAL_MS;
      const arriving = pulseAge >= 0 && pulseAge < 1;

      const roundSeats = reducedMotion
        ? SEATS_PER_ROUND
        : seats % (SEATS_PER_ROUND + 1);
      const total = roundSeats * SHARE_PER_SEAT_USD;
      // eased both ways, so the new month's reset shrinks the money gently
      shownTotal += (total - shownTotal) * (total < shownTotal ? 0.035 : 0.1);
      if (isDefined(totalValueRef.current)) {
        totalValueRef.current.textContent = USD.format(Math.round(shownTotal));
      }

      // the money grows steadily with the month's total; an arrival only
      // sends a faint ring outward, the money itself never jumps
      const growth =
        1 +
        ((width < 768 ? 0.25 : 0.5) * shownTotal) /
          (SEATS_PER_ROUND * SHARE_PER_SEAT_USD);
      hubRing.forEach((part) => part.scale.setScalar(growth));
      if (arriving) {
        pulse.scale.setScalar(growth * (1 + 0.22 * ease(pulseAge)));
        pulseMaterial.opacity = 0.35 * (1 - ease(pulseAge));
      } else {
        pulseMaterial.opacity = 0;
      }

      WORK.forEach((tool, index) => {
        const element = toolRefs.current[index];
        if (!isDefined(element)) return;
        const x = tool.at[0] * TILE;
        const y = tool.at[1] * TILE;
        const shown = arrive(x, y);
        anchor.set(x, y, 0);
        stage.place(element, anchor, shown, 0.85 + 0.15 * shown);
      });
      if (isDefined(hubRef.current)) {
        anchor.set(0, 0, 0);
        const shown = arrive(0, 0);
        stage.place(
          hubRef.current,
          anchor,
          shown,
          growth * (0.85 + 0.15 * shown),
        );
      }

      stage.render();
    };
    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      hero?.removeEventListener('pointermove', forward);
      hero?.removeEventListener('pointerleave', forward);
      lines.forEach((material) => material.dispose());
      stage.dispose();
    };
  }, []);

  return (
    <Backdrop aria-hidden ref={frameRef}>
      <SceneOverlay>
        {WORK.map((piece, index) => (
          <LogoNode
            key={piece.name}
            ref={(element) => {
              toolRefs.current[index] = element;
            }}
          >
            <piece.icon size={20} stroke={1.6} />
          </LogoNode>
        ))}
        <LogoNode data-hub="" ref={hubRef}>
          <HubAmount>
            <HubValue ref={totalValueRef}>{USD.format(0)}</HubValue>
            <HubPeriod>{i18n._(msg`/ month`)}</HubPeriod>
          </HubAmount>
        </LogoNode>
      </SceneOverlay>
    </Backdrop>
  );
}
