'use client';

import { styled } from '@linaria/react';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import {
  createHalftoneDotStage,
  createHalftoneToneMaterial,
} from '@/platform/visuals/halftone-dots/create-halftone-dot-stage';
import {
  HalftoneModel,
  type HalftoneModelProps,
} from '@/platform/visuals/rigs/HalftoneModel';
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
// The rings: short arcs drawn in halftone, in grey, that travel with the
// apps. About a halftone cell thick, with a gap between arcs.
const RING_ARCS = { count: 64, fill: 0.62, tube: 0.05 } as const;

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

// Twenty's logo as the site draws its objects (the partners services, the
// home cards): a model in the site's band halftone, the 20 cut through it.
const MARK_MODEL_URL = '/models/twenty-logo.glb';
const MARK_MODEL_SETTINGS = {
  previewDistance: 4.5,
  lighting: {
    intensity: 1.5,
    fillIntensity: 0.48,
    ambientIntensity: 0.3,
    angleDegrees: 53,
    height: 2,
  },
  material: {
    surface: 'solid',
    color: 0xd4d0c8,
    roughness: 0.42,
    metalness: 0.15,
  },
  halftone: {
    variant: 'band',
    // finer than the services' 14: the mark sits among fine rings
    scale: 10,
    power: 0.4,
    width: 0.5,
    dashColor: paletteColorNumber('blue'),
    hoverDashColor: paletteColorNumber('blue'),
  },
  // it floats and drifts a little, as a held object would, never far
  // enough to lose the 20
  animation: {
    autoRotateEnabled: false,
    autoWobble: 0.04,
    floatEnabled: true,
    floatSpeed: 0.9,
    floatAmplitude: 0.05,
    driftAmount: 14,
    followDragEnabled: false,
    springReturnEnabled: true,
    springDamping: 0.6,
    springStrength: 0.06,
  },
} satisfies HalftoneModelProps['settings'];
// At that distance the logo fills about this share of its frame.
const MARK_MODEL_FILL = 0.6;

const Banner = styled(SceneBanner)`
  cursor: grab;
  isolation: isolate;
  touch-action: pan-y;

  &:active {
    cursor: grabbing;
  }
`;

// The logo's own canvas, under the rings: sized and placed each frame on
// the mark's place in the scene (--mark-x / --mark-y / --mark-size).
const MarkLayer = styled.div`
  height: var(--mark-size, 0);
  left: var(--mark-x, 50%);
  pointer-events: none;
  position: absolute;
  top: var(--mark-y, 50%);
  transform: translate(-50%, -50%);
  width: var(--mark-size, 0);
  z-index: -1;
`;

// An app on the ring: its logo, placed each frame
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

// The logo as the app ships it, no chip around it.
const AppLogo = styled.img`
  border-radius: ${radius(2)};
  display: block;
  height: 28px;
  object-fit: contain;
  width: 28px;

  ${mediaUp('md')} {
    height: 34px;
    width: 34px;
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
      // the stage draws only the rings: a fine grain keeps them fine lines
      cellPx: 4,
      dotColor: paletteColorNumber('ash'),
      fov: 30,
      shape: 'mixed',
    });
    if (!isDefined(stage)) return;
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // the camera keeps the outer ring at about 67% of the banner's width,
    // so on wide screens the scene grows instead of shrinking to the middle
    const viewDirection = new THREE.Vector3(0, 5.2, 20).normalize();
    const LOOK_AT = new THREE.Vector3(0, -1, 0);
    // the camera looks down on the scene: the mark tips back by as much
    const MARK_FACING_PITCH = -Math.atan2(viewDirection.y, viewDirection.z);
    const outerDiameter = 2 * Math.max(...RINGS.map((ring) => ring.radius));
    const frameCamera = () => {
      const halfHeight = Math.tan((stage.camera.fov / 2) * (Math.PI / 180));
      const distance = THREE.MathUtils.clamp(
        outerDiameter / (0.67 * 2 * halfHeight * stage.camera.aspect),
        11,
        17.5,
      );
      stage.camera.position.copy(viewDirection).multiplyScalar(distance);
      stage.camera.lookAt(LOOK_AT);
    };
    frameCamera();

    // The mark is drawn by its own halftone canvas (MarkLayer). Here it
    // is only a shape the rings can pass behind: depth, no colour.
    const SIDE = 40;
    const MARK_SCALE = 0.083;
    const mark = new THREE.Group();
    stage.tone.add(mark);
    let disposed = false;
    fetch(MARK_URL)
      .then((response) => response.text())
      .then((text) => {
        if (disposed) return;
        const svg = new SVGLoader().parse(text);
        const square =
          svg.paths.find((path) => path.color.getHex() !== 0xffffff) ??
          svg.paths[0];
        const DEPTH = 7;
        const maskGeometry = new THREE.ExtrudeGeometry(
          SVGLoader.createShapes(square),
          { bevelEnabled: false, curveSegments: 12, depth: DEPTH },
        ).translate(-SIDE / 2, -SIDE / 2, -DEPTH / 2);
        const maskMesh = new THREE.Mesh(
          maskGeometry,
          new THREE.MeshBasicMaterial({ colorWrite: false }),
        );
        maskMesh.renderOrder = -1;
        maskMesh.scale.set(MARK_SCALE, -MARK_SCALE, MARK_SCALE);
        mark.add(maskMesh);
      });
    // where the mark sits on screen, for its canvas
    const markCentre = new THREE.Vector3();
    const markEdge = new THREE.Vector3();
    const placeMarkLayer = () => {
      const bounds = frame.getBoundingClientRect();
      markCentre.set(0, 0, 0).project(stage.camera);
      markEdge.set((SIDE / 2) * MARK_SCALE, 0, 0).project(stage.camera);
      const sidePx = Math.abs(markEdge.x - markCentre.x) * bounds.width;
      frame.style.setProperty(
        '--mark-x',
        `${((markCentre.x * 0.5 + 0.5) * bounds.width).toFixed(1)}px`,
      );
      frame.style.setProperty(
        '--mark-y',
        `${((-markCentre.y * 0.5 + 0.5) * bounds.height).toFixed(1)}px`,
      );
      frame.style.setProperty(
        '--mark-size',
        `${(sidePx / MARK_MODEL_FILL).toFixed(1)}px`,
      );
    };

    // each ring's path: arcs in halftone, hidden where they run behind the
    // mark (its mask writes depth only), turning with the ring's apps
    const arcStep = (Math.PI * 2) / RING_ARCS.count;
    const rings = RINGS.map((config) => {
      const group = new THREE.Group();
      group.position.y = config.height;
      group.rotation.z = config.tilt;
      stage.tone.add(group);
      const arcs = Array.from({ length: RING_ARCS.count }, (_, index) =>
        new THREE.TorusGeometry(
          config.radius,
          RING_ARCS.tube,
          6,
          6,
          arcStep * RING_ARCS.fill,
        )
          // the torus lies in xy: lay it flat, then set it in its place
          .rotateX(Math.PI / 2)
          .rotateY(index * arcStep),
      );
      const path = new THREE.Mesh(
        mergeGeometries(arcs),
        createHalftoneToneMaterial(0.6, 0.2),
      );
      arcs.forEach((arc) => arc.dispose());
      group.add(path);
      return { config, group, path };
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
      // the mask faces the camera, as the logo's own canvas does
      mark.rotation.x = MARK_FACING_PITCH;
      placeMarkLayer();
      // the rings sway slowly, out of step with each other
      rings.forEach(({ config, group }, index) => {
        if (reducedMotion) return;
        const phase = index * Math.PI;
        group.rotation.x = 0.06 * Math.sin(now / 6200 + phase);
        group.rotation.z = config.tilt + 0.07 * Math.sin(now / 5100 + phase);
      });
      rings.forEach(({ config, path }) => {
        path.rotation.y = spin * config.speed;
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
      <MarkLayer>
        <HalftoneModel
          modelUrl={MARK_MODEL_URL}
          settings={MARK_MODEL_SETTINGS}
        />
      </MarkLayer>
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
