'use client';

import { styled } from '@linaria/react';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import {
  createHalftoneDotStage,
  createHalftoneToneMaterial,
} from '@/platform/visuals/halftone-dots/create-halftone-dot-stage';
import {
  SceneBanner,
  SceneOverlay,
} from '@/platform/visuals/halftone-dots/halftone-dot-scene-parts';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  DURATION,
  EASING,
  fontSize,
  mediaUp,
  paletteColorNumber,
  radius,
  semanticColor,
} from '@/tokens';

import { type MarketplaceApp } from './marketplace-app';

// The apps hero: the Twenty mark, extruded and drawn in the home's halftone
// dots, with the marketplace's apps turning around it on a tilted ring (the
// orbit's labels: logo and name, repeated so the ring reads as plenty). The
// ring's path is a fine line that passes behind the mark and barely rocks
// as it turns; its far side fades out so it never crowds the mark. Drag to
// turn it.
const MARK_URL = '/images/shared/halftone/twenty-logo.svg';
const AUTO_SPIN = 0.0016;
// Two rings close around the mark, tipped opposite ways and turning in
// opposite directions, so the apps cross in front of it.
const RINGS = [
  { radius: 6.4, tilt: -0.2, height: 0.2, speed: 1 },
  { radius: 8.2, tilt: 0.16, height: -0.2, speed: -0.8 },
];

type Slot = { ring: number; angle: number; app: number };

// Each app twice, once on each ring: the outer ring runs the same list
// shifted by half, so an app's two copies never sit near each other.
const buildSlots = (appCount: number): Slot[] =>
  RINGS.flatMap((_ring, ring) =>
    Array.from({ length: appCount }, (_, position) => ({
      ring,
      // offset so the two rings' apps don't line up
      angle: ((position + ring * 0.5) / Math.max(appCount, 1)) * Math.PI * 2,
      app: (position + ring * Math.floor(appCount / 2)) % appCount,
    })),
  );

const Banner = styled(SceneBanner)`
  cursor: grab;
  touch-action: pan-y;

  &:active {
    cursor: grabbing;
  }
`;

// An app on the ring: its logo on a white chip, placed each frame
// (--x / --y / --s / --o). Its name shows on hover.
const AppLabel = styled.div`
  backface-visibility: hidden;
  cursor: default;
  display: none;
  left: 0;
  opacity: var(--o, 0);
  pointer-events: auto;
  position: absolute;
  top: 0;
  transform: translate(var(--x), var(--y)) translate(-50%, -50%)
    scale(var(--s, 1));
  /* moved on the GPU: no re-layout or re-raster as it travels */
  will-change: transform, opacity;
`;

const AppLogo = styled.img`
  background-color: ${color('white')};
  border-radius: ${radius(2)};
  display: block;
  height: 40px;
  object-fit: contain;
  padding: 8px;
  width: 40px;

  ${mediaUp('md')} {
    height: 48px;
    padding: 10px;
    width: 48px;
  }
`;

// The app's name, above its chip, on hover only.
const AppName = styled.span`
  background-color: ${color('white')};
  border-radius: ${radius(1.5)};
  bottom: calc(100% + 6px);
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.medium};
  left: 50%;
  line-height: 1;
  opacity: 0;
  padding: 6px 8px;
  pointer-events: none;
  position: absolute;
  transform: translate(-50%, 4px);
  transition:
    opacity ${DURATION.sm} ${EASING.standard},
    transform ${DURATION.sm} ${EASING.standard};
  white-space: nowrap;

  ${AppLabel}:hover & {
    opacity: 1;
    transform: translate(-50%, 0);
  }
`;

type AppsMarkOrbitProps = {
  apps: readonly MarketplaceApp[];
};

export function AppsMarkOrbit({ apps }: AppsMarkOrbitProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  // a hovered app holds the rings still so its name can be read
  const hoveredRef = useRef(false);
  // each logo once, even when the list repeats an app
  const appsWithLogo = useMemo(
    () =>
      apps.filter(
        (app, index) =>
          isNonEmptyString(app.logoUrl) &&
          apps.findIndex((other) => other.logoUrl === app.logoUrl) === index,
      ),
    [apps],
  );
  const slots = useMemo(
    () => buildSlots(appsWithLogo.length),
    [appsWithLogo.length],
  );

  useEffect(() => {
    const frame = frameRef.current;
    if (!isDefined(frame) || appsWithLogo.length === 0) return;
    const stage = createHalftoneDotStage(frame, {
      cellPx: 7,
      fov: 30,
      shape: 'mixed',
    });
    if (!isDefined(stage)) return;
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // the camera keeps the outer ring at about 60% of the banner's width,
    // so on wide screens the scene grows instead of shrinking to the middle
    const viewDirection = new THREE.Vector3(0, 5.2, 20).normalize();
    const LOOK_AT = new THREE.Vector3(0, -1.2, 0);
    const outerDiameter = 2 * Math.max(...RINGS.map((ring) => ring.radius));
    const frameCamera = () => {
      const halfHeight = Math.tan((stage.camera.fov / 2) * (Math.PI / 180));
      const distance = THREE.MathUtils.clamp(
        outerDiameter / (0.6 * 2 * halfHeight * stage.camera.aspect),
        13,
        21,
      );
      stage.camera.position.copy(viewDirection).multiplyScalar(distance);
      stage.camera.lookAt(LOOK_AT);
    };
    frameCamera();

    // the mark: the badge's white glyph, extruded with a bevel
    const mark = new THREE.Group();
    mark.position.y = 0.6;
    stage.tone.add(mark);
    let disposed = false;
    fetch(MARK_URL)
      .then((response) => response.text())
      .then((text) => {
        if (disposed) return;
        const svg = new SVGLoader().parse(text);
        const glyph =
          svg.paths.find((path) => path.color.getHex() === 0xffffff) ??
          svg.paths[svg.paths.length - 1];
        const geometry = new THREE.ExtrudeGeometry(
          SVGLoader.createShapes(glyph),
          {
            bevelEnabled: true,
            bevelSegments: 4,
            bevelSize: 0.35,
            bevelThickness: 0.5,
            curveSegments: 24,
            depth: 3.2,
          },
        );
        geometry.center();
        const mesh = new THREE.Mesh(
          geometry,
          createHalftoneToneMaterial(0.52, 0.44),
        );
        // svg y runs down
        mesh.scale.set(0.17, -0.17, 0.17);
        mark.add(mesh);
      });

    // each ring's path: a fine line, hidden where it runs behind the mark
    const rings = RINGS.map((config) => {
      const group = new THREE.Group();
      group.position.y = config.height;
      group.rotation.z = config.tilt;
      stage.crisp.add(group);
      const pathGeometry = new LineGeometry();
      pathGeometry.setPositions(
        Array.from({ length: 257 }, (_, index) => {
          const angle = (index / 256) * Math.PI * 2;
          return [
            Math.sin(angle) * config.radius,
            0,
            Math.cos(angle) * config.radius,
          ];
        }).flat(),
      );
      group.add(
        new Line2(
          pathGeometry,
          new LineMaterial({
            color: paletteColorNumber('blue'),
            linewidth: 1,
            opacity: 0.35,
            resolution: stage.lineResolution,
            transparent: true,
          }),
        ),
      );
      return { config, group };
    });
    const layers = slots.map(() => -1);

    // drag to throw, then ease back to the slow spin
    let spin = 0;
    let velocity = reducedMotion ? 0 : AUTO_SPIN;
    let dragging = false;
    let lastX = 0;
    const onDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      frame.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      velocity = (event.clientX - lastX) * 0.004;
      lastX = event.clientX;
      spin += velocity;
    };
    const onUp = () => {
      dragging = false;
    };
    frame.addEventListener('pointerdown', onDown);
    frame.addEventListener('pointermove', onMove);
    frame.addEventListener('pointerup', onUp);
    frame.addEventListener('pointercancel', onUp);

    let animationFrame = 0;
    const render = (now: number) => {
      animationFrame = requestAnimationFrame(render);
      if (!stage.isVisible()) return;
      frameCamera();

      if (!dragging) {
        const target = reducedMotion || hoveredRef.current ? 0 : AUTO_SPIN;
        velocity += (target - velocity) * 0.06;
        spin += velocity;
      }
      // the mark sways a little so its sides catch the light
      mark.rotation.y = reducedMotion
        ? -0.35
        : -0.35 + 0.12 * Math.sin(now / 2600);
      // the rings sway slowly, out of step with each other
      rings.forEach(({ config, group }, index) => {
        if (reducedMotion) return;
        const phase = index * Math.PI;
        group.rotation.x = 0.06 * Math.sin(now / 6200 + phase);
        group.rotation.z = config.tilt + 0.07 * Math.sin(now / 5100 + phase);
      });
      stage.tone.updateMatrixWorld(true);
      stage.crisp.updateMatrixWorld(true);

      const placed = slots.map((slot, index) => {
        const { config, group } = rings[slot.ring];
        const angle = slot.angle + spin * config.speed;
        const position = new THREE.Vector3(
          Math.sin(angle) * config.radius,
          // just above the line
          0.5,
          Math.cos(angle) * config.radius,
        ).applyMatrix4(group.matrixWorld);
        const depth = Math.cos(angle);
        return {
          index,
          position,
          depth,
          // the far side stays readable, lighter; only the stretch right
          // behind the mark clears
          opacity:
            (0.45 + 0.55 * THREE.MathUtils.smoothstep(depth, -0.6, 0.3)) *
            (depth < 0
              ? THREE.MathUtils.smoothstep(Math.abs(Math.sin(angle)), 0.18, 0.4)
              : 1),
        };
      });
      placed.forEach((entry) => {
        const label = labelRefs.current[entry.index];
        if (!isDefined(label)) return;
        stage.place(
          label,
          entry.position,
          entry.opacity,
          0.82 + (0.18 * (entry.depth + 1)) / 2,
        );
        // restack only when the order changes
        const layer = Math.round((entry.depth + 1) * 20);
        if (layer !== layers[entry.index]) {
          layers[entry.index] = layer;
          label.style.zIndex = String(layer);
        }
      });

      stage.render();
    };
    animationFrame = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      frame.removeEventListener('pointerdown', onDown);
      frame.removeEventListener('pointermove', onMove);
      frame.removeEventListener('pointerup', onUp);
      frame.removeEventListener('pointercancel', onUp);
      stage.dispose();
    };
  }, [appsWithLogo, slots]);

  if (appsWithLogo.length === 0) {
    return null;
  }

  return (
    <Banner aria-hidden ref={frameRef}>
      <SceneOverlay>
        {slots.map((slot, index) => {
          const app = appsWithLogo[slot.app];
          return (
            <AppLabel
              onPointerEnter={() => {
                hoveredRef.current = true;
              }}
              onPointerLeave={() => {
                hoveredRef.current = false;
              }}
              key={`${slot.ring}-${app.slug}`}
              ref={(element) => {
                labelRefs.current[index] = element;
              }}
            >
              <AppLogo alt="" src={app.logoUrl} />
              <AppName>{app.name}</AppName>
            </AppLabel>
          );
        })}
      </SceneOverlay>
    </Banner>
  );
}
