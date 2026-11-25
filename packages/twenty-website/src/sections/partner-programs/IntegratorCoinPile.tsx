'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { isDefined } from 'twenty-shared/utils';

import {
  createHalftoneDotStage,
  createHalftoneToneMaterial,
} from '@/platform/visuals/halftone-dots/create-halftone-dot-stage';
import { mediaUp } from '@/tokens';

// The commission as coins piling up, drawn in the home's halftone. Each coin
// reads as one: a raised rim, a boss at its centre, a striped edge in a
// stack. More seats, more coins: they drop onto the stacks; fewer, the top
// ones lift away.
const COIN = { radius: 0.46, height: 0.13, pitch: 0.155 };
// A loose cluster, the tallest stack in the middle: x, z, and its share of
// the tallest height.
const STACKS: readonly (readonly [number, number, number])[] = [
  [0, 0, 1],
  [1.05, 0.25, 0.78],
  [-1.05, 0.2, 0.7],
  [0.5, 1.05, 0.52],
  [-0.55, 1.1, 0.44],
  [1.6, 1.2, 0.28],
  [-1.75, 1.25, 0.22],
];
const MAX_LEVELS = 22;
const DROP = { height: 1.2, ms: 380, staggerMs: 22 };
const LEAVE_MS = 200;
// Alternate tones down a stack: the edge reads striped, like milled coins.
const TONES = [0.68, 0.57] as const;

// Close to the site's default curve: fast, then settling.
const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 4);
// A light overshoot as a coin lands (surface-motion's emphasis curve).
const easeOutBack = (t: number) => {
  const clamped = Math.min(Math.max(t, 0), 1);
  const overshoot = 1.2;
  return (
    1 +
    (overshoot + 1) * Math.pow(clamped - 1, 3) +
    overshoot * Math.pow(clamped - 1, 2)
  );
};

// A coin: its body, a rim standing proud of the top face and a low boss at
// the centre, merged so each coin is one mesh.
const coinGeometry = () => {
  const top = COIN.height / 2;
  const body = new THREE.CylinderGeometry(
    COIN.radius,
    COIN.radius,
    COIN.height,
    48,
  );
  const rim = new THREE.TorusGeometry(COIN.radius - 0.05, 0.035, 10, 48)
    .rotateX(Math.PI / 2)
    .translate(0, top, 0);
  const boss = new THREE.CylinderGeometry(0.2, 0.22, 0.04, 36).translate(
    0,
    top + 0.02,
    0,
  );
  const merged = mergeGeometries([
    body.toNonIndexed(),
    rim.toNonIndexed(),
    boss.toNonIndexed(),
  ]);
  [body, rim, boss].forEach((geometry) => geometry.dispose());
  return merged;
};

const Frame = styled.div`
  height: 270px;
  position: relative;
  width: 100%;

  ${mediaUp('md')} {
    height: 500px;
  }

  canvas {
    display: block;
    height: 100%;
    inset: 0;
    position: absolute;
    width: 100%;
  }
`;

type Coin = {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  rest: number;
  restY: number;
  wanted: boolean;
  changedAt: number;
};

type IntegratorCoinPileProps = {
  // how high the pile is, 0 to 1
  fill: number;
};

export function IntegratorCoinPile({ fill }: IntegratorCoinPileProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef(fill);
  const applyRef = useRef<((next: number) => void) | null>(null);

  useEffect(() => {
    fillRef.current = fill;
    applyRef.current?.(fill);
  }, [fill]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!isDefined(frame)) return;
    const stage = createHalftoneDotStage(frame, { cellPx: 3, fov: 24 });
    if (!isDefined(stage)) return;
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const geometry = coinGeometry();
    // stacks[stack][level]
    const stacks: Coin[][] = STACKS.map(([x, z]) =>
      Array.from({ length: MAX_LEVELS }, (_coin, level) => {
        const rest = TONES[level % TONES.length];
        const material = createHalftoneToneMaterial(rest, 0.32);
        const mesh = new THREE.Mesh(geometry, material);
        const restY = COIN.height / 2 + level * COIN.pitch;
        // each coin a little off true, as a real stack is
        mesh.position.set(
          x + Math.sin(level * 2.3 + x * 5) * 0.03,
          restY,
          z + Math.cos(level * 1.7 + z * 5) * 0.03,
        );
        mesh.rotation.y = level * 0.6;
        mesh.visible = false;
        stage.tone.add(mesh);
        return {
          mesh,
          material,
          rest,
          restY,
          wanted: false,
          changedAt: -Infinity,
        };
      }),
    );

    // the floor's shadow under the pile, a soft field of small dots
    const shadowGeometry = new THREE.CircleGeometry(1, 48);
    const shadow = new THREE.Mesh(
      shadowGeometry,
      createHalftoneToneMaterial(0.47, 0),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, 0.002, 0.6);
    shadow.scale.set(2.6, 1.5, 1);
    stage.tone.add(shadow);

    let started = false;
    let pending: number | null = fillRef.current;
    // New coins drop in from the lowest gap up, stack after stack; removed
    // ones lift away at once.
    const apply = (next: number, now: number) => {
      const share = Math.min(Math.max(next, 0), 1);
      let order = 0;
      for (let level = 0; level < MAX_LEVELS; level += 1) {
        stacks.forEach((stack, index) => {
          const count = Math.max(
            1,
            Math.round(share * STACKS[index][2] * MAX_LEVELS),
          );
          const coin = stack[level];
          const wanted = level < count;
          if (wanted === coin.wanted) return;
          coin.wanted = wanted;
          coin.changedAt = wanted ? now + order * DROP.staggerMs : now;
          if (wanted) order += 1;
        });
      }
    };
    applyRef.current = (next) => {
      if (started) apply(next, performance.now());
      else pending = next;
    };

    // The whole pile at its tallest fits the frame, seen from the front and
    // a little above.
    const bounds = new THREE.Box3();
    stacks.forEach((stack) =>
      stack.forEach((coin) => bounds.expandByObject(coin.mesh)),
    );
    bounds.expandByObject(shadow);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const viewLine = new THREE.Vector3(0.28, 0.5, 1).normalize();

    let animationFrame = 0;
    const render = (now: number) => {
      animationFrame = requestAnimationFrame(render);
      if (!stage.isVisible()) return;
      if (!started) {
        started = true;
        if (pending !== null) apply(pending, now);
        pending = null;
      }

      const halfVertical = (stage.camera.fov / 2) * (Math.PI / 180);
      const halfHorizontal = Math.atan(
        Math.tan(halfVertical) * stage.camera.aspect,
      );
      const distance =
        0.98 *
          Math.max(
            (size.y * 0.9 + size.z * 0.45) / 2 / Math.tan(halfVertical),
            size.x / 2 / Math.tan(halfHorizontal),
          ) +
        size.z / 2;
      stage.camera.position
        .copy(center)
        .add(viewLine.clone().multiplyScalar(distance));
      stage.camera.lookAt(center);

      stacks.forEach((stack) =>
        stack.forEach((coin) => {
          const age = now - coin.changedAt;
          if (coin.wanted) {
            if (age < 0) {
              coin.mesh.visible = false;
              return;
            }
            const t = reducedMotion ? 1 : age / DROP.ms;
            coin.mesh.visible = true;
            coin.mesh.position.y =
              coin.restY + (1 - easeOutBack(t)) * DROP.height;
            coin.mesh.scale.setScalar(0.85 + 0.15 * easeOut(t));
            coin.material.uniforms.uBase.value = coin.rest;
            return;
          }
          const t = reducedMotion ? 1 : age / LEAVE_MS;
          if (t >= 1) {
            coin.mesh.visible = false;
            return;
          }
          // lifts a little and thins out into the paper
          coin.mesh.position.y = coin.restY + easeOut(t) * 0.3;
          coin.material.uniforms.uBase.value =
            coin.rest + (0.36 - coin.rest) * easeOut(t);
        }),
      );

      stage.render();
    };
    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      applyRef.current = null;
      geometry.dispose();
      shadowGeometry.dispose();
      stage.dispose();
    };
  }, []);

  return <Frame aria-hidden ref={frameRef} />;
}
