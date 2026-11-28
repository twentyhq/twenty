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
  paletteColorNumber,
  radius,
  semanticColor,
  UNITS,
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
// At that distance the logo fills this share of its frame (measured on
// the drawn logo).
const MARK_MODEL_FILL = 0.7;
// The mask the rings and apps pass behind takes this share of the logo:
// the logo floats and drifts, the mask stays put, so it keeps to the
// least the logo covers and never shows past its edges.
const MARK_MASK_SHARE = 0.95;
// An app's logo on screen, where it passes in front: 12% larger than the
// 28 / 34px it had.
const APP_PX = { base: 31, md: 38 } as const;
// The room an app on the far side keeps under the banner's top edge.
const APP_TOP_MARGIN_PX = 12;
// Its thickness, as a share of its side, drawn in this many layers; the
// layers inside are this much darker than its face.
const APP_THICKNESS = 0.12;
const APP_LAYERS = 12;
const APP_EDGE_SHADE = 0.78;
// The texture the logo is drawn into, in pixels, its corners rounded as
// the site rounds an app's logo (radius(2)).
const APP_TEXTURE_PX = 128;
const APP_CORNER = (2 * UNITS.radiusBasePx) / 34;

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

// The apps themselves are drawn in the scene (see below), so the logo
// hides them as it hides the rings. This is only where the hovered app's
// name shows, placed each frame on that app (--x / --y).
const AppLabel = styled.div`
  display: none;
  height: 34px;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  transform: translate(var(--x), var(--y)) translate(-50%, -50%);
  width: 34px;
  will-change: transform;
`;

// The app's name, above it, on hover only.
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

  ${AppLabel}[data-shown] & {
    opacity: 1;
    transform: translate(-50%, 0);
  }
`;

type AppsMarkOrbitProps = {
  apps: readonly MarketplaceApp[];
};

// An app's logo drawn into a square texture, contained and with its
// corners rounded, as the site shows an app's logo.
const loadAppTexture = async (logoUrl: string): Promise<THREE.Texture> => {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = logoUrl;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = APP_TEXTURE_PX;
  canvas.height = APP_TEXTURE_PX;
  const context = canvas.getContext('2d');
  if (isDefined(context)) {
    const fit = Math.min(
      APP_TEXTURE_PX / (image.naturalWidth || APP_TEXTURE_PX),
      APP_TEXTURE_PX / (image.naturalHeight || APP_TEXTURE_PX),
    );
    const width = (image.naturalWidth || APP_TEXTURE_PX) * fit;
    const height = (image.naturalHeight || APP_TEXTURE_PX) * fit;
    context.beginPath();
    context.roundRect(0, 0, APP_TEXTURE_PX, APP_TEXTURE_PX, [
      APP_TEXTURE_PX * APP_CORNER,
    ]);
    context.clip();
    context.drawImage(
      image,
      (APP_TEXTURE_PX - width) / 2,
      (APP_TEXTURE_PX - height) / 2,
      width,
      height,
    );
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

export function AppsMarkOrbit({ apps }: AppsMarkOrbitProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
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
    // On a wide banner (its height stops at 396px) the rings' far side would
    // run off the top, which clips it: the scene then slides down, its size
    // kept, until every app clears the top. The near side may run off the
    // bottom, into the next section. Tested at the rings' widest sway, so
    // the scene holds still as they rock.
    const ringPose = new THREE.Object3D();
    const sample = new THREE.Vector3();
    const clearsTop = (appPx: number, heightPx: number) => {
      stage.camera.updateMatrixWorld();
      for (const config of RINGS) {
        for (const sway of [-1, 1]) {
          ringPose.position.set(0, config.height, 0);
          ringPose.rotation.set(0.06 * sway, 0, config.tilt + 0.07 * sway);
          ringPose.updateMatrixWorld();
          for (let step = 0; step < 48; step++) {
            const angle = (step / 48) * Math.PI * 2;
            sample
              .set(
                Math.sin(angle) * config.radius,
                0.5,
                Math.cos(angle) * config.radius,
              )
              .applyMatrix4(ringPose.matrixWorld)
              .project(stage.camera);
            const yPx = ((1 - sample.y) / 2) * heightPx;
            if (yPx < appPx / 2 + APP_TOP_MARGIN_PX) return false;
          }
        }
      }
      return true;
    };
    const lift = new THREE.Vector3();
    const lookAt = new THREE.Vector3();
    let framedAspect = 0;
    let framedDistance = 0;
    const placeCamera = () => {
      stage.camera.position
        .copy(viewDirection)
        .multiplyScalar(framedDistance)
        .add(lift);
      stage.camera.lookAt(lookAt.copy(LOOK_AT).add(lift));
    };
    const frameCamera = () => {
      if (stage.camera.aspect !== framedAspect) {
        framedAspect = stage.camera.aspect;
        const halfHeight = Math.tan((stage.camera.fov / 2) * (Math.PI / 180));
        framedDistance = THREE.MathUtils.clamp(
          outerDiameter / (0.67 * 2 * halfHeight * stage.camera.aspect),
          11,
          17.5,
        );
        const appPx = frame.clientWidth >= 768 ? APP_PX.md : APP_PX.base;
        lift.set(0, 0, 0);
        for (let tries = 0; tries < 60; tries++) {
          placeCamera();
          if (clearsTop(appPx, frame.clientHeight)) break;
          lift.y += 0.05;
        }
      }
      placeCamera();
    };
    frameCamera();

    // The mark is drawn by its own halftone canvas (MarkLayer). Here it
    // is only a shape the rings and the apps pass behind: depth, no colour.
    const SIDE = 40;
    const MARK_SCALE = 0.0968;
    const mark = new THREE.Group();
    stage.tone.add(mark);
    let disposed = false;
    let maskMesh: THREE.Mesh | null = null;
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
        maskMesh = new THREE.Mesh(
          maskGeometry,
          new THREE.MeshBasicMaterial({ colorWrite: false }),
        );
        maskMesh.renderOrder = -1;
        const maskScale = MARK_SCALE * MARK_MASK_SHARE;
        maskMesh.scale.set(maskScale, -maskScale, maskScale);
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
      // the ring's apps, drawn sharp (not in halftone) in the same place
      const appGroup = new THREE.Group();
      stage.crisp.add(appGroup);
      return { config, group, path, appGroup };
    });

    // The apps: each a logo with a little thickness, facing out from the
    // ring's centre, so it turns as it goes round and shows its back on the
    // far side. Drawn after the mask's depth, the logo hides them as it
    // hides the rings. The thickness is the logo's own shape stacked a few
    // times, its inner layers darker, so a logo without a tile behind it
    // keeps its shape and gets no chip.
    const appGeometry = new THREE.PlaneGeometry(1, 1);
    const textures = appsWithLogo.map(() => null as THREE.Texture | null);
    const appMaterial = (shade: number, side: THREE.Side) =>
      new THREE.MeshBasicMaterial({
        alphaTest: 0.5,
        alphaToCoverage: true,
        color: new THREE.Color(shade, shade, shade),
        side,
        visible: false,
      });
    const faceMaterials = appsWithLogo.map(() =>
      appMaterial(1, THREE.FrontSide),
    );
    const edgeMaterials = appsWithLogo.map(() =>
      appMaterial(APP_EDGE_SHADE, THREE.DoubleSide),
    );
    appsWithLogo.forEach((app, index) => {
      if (!isNonEmptyString(app.logoUrl)) return;
      loadAppTexture(app.logoUrl)
        .then((texture) => {
          if (disposed) {
            texture.dispose();
            return;
          }
          textures[index] = texture;
          [faceMaterials[index], edgeMaterials[index]].forEach((material) => {
            material.map = texture;
            material.visible = true;
            material.needsUpdate = true;
          });
        })
        .catch(() => undefined);
    });
    const pieces = slots.map((slot) => {
      const pivot = new THREE.Group();
      // a face on each side, so the logo reads the right way round from
      // either side, and the layers of its thickness between them
      const front = new THREE.Mesh(appGeometry, faceMaterials[slot.app]);
      front.position.z = APP_THICKNESS / 2;
      const back = new THREE.Mesh(appGeometry, faceMaterials[slot.app]);
      back.position.z = -APP_THICKNESS / 2;
      back.rotation.y = Math.PI;
      pivot.add(front, back);
      for (let layer = 1; layer < APP_LAYERS; layer++) {
        const edge = new THREE.Mesh(appGeometry, edgeMaterials[slot.app]);
        edge.position.z = APP_THICKNESS * (layer / APP_LAYERS - 0.5);
        pivot.add(edge);
      }
      rings[slot.ring].appGroup.add(pivot);
      return { pivot, faces: [front, back] };
    });
    // The far side reads lighter: the apps fade into the page's colour with
    // their distance, as far things do.
    const pageColor = (() => {
      for (
        let element: HTMLElement | null = frame;
        isDefined(element);
        element = element.parentElement
      ) {
        const background = getComputedStyle(element).backgroundColor;
        if (!/rgba\(.*,\s*0\)$|transparent/.test(background)) {
          return new THREE.Color(background);
        }
      }
      return new THREE.Color(0xffffff);
    })();
    const fog = new THREE.Fog(pageColor, 0, 1);
    stage.crisp.fog = fog;
    const outerRadius = outerDiameter / 2;
    const hitTargets: THREE.Object3D[] = pieces.flatMap(({ faces }) => faces);
    let hovered = -1;

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

    const worldPosition = new THREE.Vector3();
    // the app under the pointer, unless the logo is in front of it
    const findHovered = () => {
      const ray = stage.pointerRay();
      if (!isDefined(ray) || dragging) return -1;
      const targets = isDefined(maskMesh)
        ? [...hitTargets, maskMesh]
        : hitTargets;
      // nearest first: the mask in front means the app is hidden
      const [hit] = ray.intersectObjects(targets, false);
      if (!isDefined(hit) || hit.object === maskMesh) return -1;
      return pieces.findIndex(({ faces }) =>
        faces.some((face) => face === hit.object),
      );
    };

    let animationFrame = 0;
    const render = (now: number) => {
      animationFrame = requestAnimationFrame(render);
      if (!stage.isVisible()) return;
      frameCamera();

      if (!dragging) {
        // a hovered app holds the rings still so its name can be read
        const target = reducedMotion || hovered >= 0 ? 0 : AUTO_SPIN;
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
      rings.forEach(({ config, group, path, appGroup }) => {
        path.rotation.y = spin * config.speed;
        appGroup.position.copy(group.position);
        appGroup.rotation.copy(group.rotation);
      });

      // the apps keep about the same size on screen wherever they are on
      // the ring, a little smaller behind, as before: only their turn is 3D
      const bounds = frame.getBoundingClientRect();
      const appPx = bounds.width >= 768 ? APP_PX.md : APP_PX.base;
      const worldPerPx =
        (2 * Math.tan((stage.camera.fov / 2) * (Math.PI / 180))) /
        Math.max(bounds.height, 1);
      const cameraDistance = stage.camera.position.length();
      fog.near = cameraDistance - outerRadius;
      // the far edge of the outer ring at about 45% of its colour
      fog.far = fog.near + (2 * outerRadius) / 0.55;
      stage.crisp.updateMatrixWorld(true);
      slots.forEach((slot, index) => {
        const { config, appGroup } = rings[slot.ring];
        const { pivot } = pieces[index];
        const angle = slot.angle + spin * config.speed;
        // just above the line
        pivot.position.set(
          Math.sin(angle) * config.radius,
          0.5,
          Math.cos(angle) * config.radius,
        );
        pivot.rotation.y = angle;
        worldPosition.copy(pivot.position).applyMatrix4(appGroup.matrixWorld);
        const depthScale = 0.82 + (0.18 * (Math.cos(angle) + 1)) / 2;
        pivot.scale.setScalar(
          appPx *
            depthScale *
            worldPerPx *
            worldPosition.distanceTo(stage.camera.position),
        );
      });
      stage.tone.updateMatrixWorld(true);
      stage.crisp.updateMatrixWorld(true);

      const nextHovered = findHovered();
      if (nextHovered !== hovered) {
        if (hovered >= 0) {
          labelRefs.current[hovered]?.removeAttribute('data-shown');
        }
        if (nextHovered >= 0) {
          labelRefs.current[nextHovered]?.setAttribute('data-shown', '');
        }
        hovered = nextHovered;
      }
      if (hovered >= 0) {
        const label = labelRefs.current[hovered];
        if (isDefined(label)) {
          pieces[hovered].pivot.getWorldPosition(worldPosition);
          stage.place(label, worldPosition);
        }
      }

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
      textures.forEach((texture) => texture?.dispose());
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
              key={`${slot.ring}-${app.slug}`}
              ref={(element) => {
                labelRefs.current[index] = element;
              }}
            >
              <AppName>{app.name}</AppName>
            </AppLabel>
          );
        })}
      </SceneOverlay>
    </Banner>
  );
}
