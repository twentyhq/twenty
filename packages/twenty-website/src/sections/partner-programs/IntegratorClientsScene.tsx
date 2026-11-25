'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { isDefined } from 'twenty-shared/utils';

import {
  createHalftoneDotStage,
  createHalftoneToneMaterial,
} from '@/platform/visuals/halftone-dots/create-halftone-dot-stage';
import {
  SceneBanner,
  SceneOverlay,
  SceneTag,
  TagDetail,
  TagMark,
  TagName,
  TagPill,
} from '@/platform/visuals/halftone-dots/halftone-dot-scene-parts';

// The integrators hero: you implement Twenty for the clients you bring.
// Each client's workspace is built layer by layer (data model, migration,
// workflows, permissions); once it's live the client keeps its seats on
// show and your 20% joins the monthly total. The figures are the Earnings
// step's: 20% of the $39 seat, so 40 + 25 + 10 seats make $585 a month.
const SEAT_PRICE_USD = 39;
const COMMISSION_SHARE = 0.2;

const CLIENTS = [
  { name: 'Acme Corp', initials: 'AC', seats: 40 },
  { name: 'Northwind Studio', initials: 'NS', seats: 25 },
  { name: 'Globex', initials: 'GL', seats: 10 },
];

const LAYERS = [
  { name: msg`Data model`, detail: msg`8 objects` },
  { name: msg`Migration`, detail: msg`12,400 records` },
  { name: msg`Workflows`, detail: msg`5 automations` },
  { name: msg`Permissions`, detail: msg`3 roles` },
];

const shareOf = (seats: number) =>
  Math.round(seats * SEAT_PRICE_USD * COMMISSION_SHARE);
const MONTHLY_TOTAL_USD = CLIENTS.reduce(
  (total, client) => total + shareOf(client.seats),
  0,
);

const USD = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
});

// One client at a time: its workspace plate lands, then the four pieces of
// work, side by side and large enough to read as what they are; the client
// goes live, its 20% joins the total, and the next client takes its place.
const PLATE_WIDTH = 8.6;
const PLATE_DEPTH = 1.8;
const PLATE_HEIGHT = 0.22;
const PIECE_HEIGHT = 1.7;
const PIECE_X: readonly number[] = [-3, -1, 1, 3];
const DROP_HEIGHT = 2.6;

const PLATE_LEAD_MS = 300;
const LAYER_MS = 850;
const DROP_MS = 600;
const LIVE_MS = 1900;
const CLEAR_MS = 500;
const CLIENT_MS = PLATE_LEAD_MS + LAYERS.length * LAYER_MS + LIVE_MS + CLEAR_MS;
const CYCLE_MS = CLIENTS.length * CLIENT_MS;

const easeOutBack = (t: number) => {
  const clamped = Math.min(Math.max(t, 0), 1);
  const overshoot = 1.4;
  return (
    1 +
    (overshoot + 1) * Math.pow(clamped - 1, 3) +
    overshoot * Math.pow(clamped - 1, 2)
  );
};
const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);

// An extruded outline standing up, facing the camera.
const extrude = (shapes: THREE.Shape[], depth = 0.28) =>
  new THREE.ExtrudeGeometry(shapes, {
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.03,
    bevelThickness: 0.03,
    curveSegments: 16,
    depth,
  });

const rectangle = (x: number, y: number, width: number, height: number) => {
  const shape = new THREE.Shape();
  shape.moveTo(x, y);
  shape.lineTo(x + width, y);
  shape.lineTo(x + width, y + height);
  shape.lineTo(x, y + height);
  shape.closePath();
  return shape;
};

// An arrow along x, pointing right (direction 1) or left (-1).
const arrow = (y: number, direction: 1 | -1) => {
  const shape = new THREE.Shape();
  const points: [number, number][] = [
    [-0.46, y - 0.08],
    [0.14, y - 0.08],
    [0.14, y - 0.2],
    [0.46, y],
    [0.14, y + 0.2],
    [0.14, y + 0.08],
    [-0.46, y + 0.08],
  ];
  points.forEach(([x, py], index) =>
    index === 0
      ? shape.moveTo(direction * x, py)
      : shape.lineTo(direction * x, py),
  );
  shape.closePath();
  return shape;
};

// Data model: a database, three disks.
const databaseGeometry = () =>
  mergeGeometries(
    [-0.33, 0, 0.33].map((y) =>
      new THREE.CylinderGeometry(0.42, 0.42, 0.26, 40).translate(0, y, 0),
    ),
  );

// Migration: records coming in, two arrows.
const migrationGeometry = () => extrude([arrow(0.22, 1), arrow(-0.22, -1)]);

// Workflows: three steps joined.
const workflowsGeometry = () =>
  extrude([
    rectangle(-0.16, 0.18, 0.32, 0.3),
    rectangle(-0.5, -0.48, 0.32, 0.3),
    rectangle(0.18, -0.48, 0.32, 0.3),
    rectangle(-0.04, -0.06, 0.08, 0.26),
    rectangle(-0.38, -0.12, 0.76, 0.08),
    rectangle(-0.38, -0.2, 0.08, 0.1),
    rectangle(0.3, -0.2, 0.08, 0.1),
  ]);

// Permissions: a shield.
const shieldGeometry = () => {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.5);
  shape.lineTo(0.42, 0.36);
  shape.lineTo(0.42, 0.02);
  shape.quadraticCurveTo(0.4, -0.34, 0, -0.52);
  shape.quadraticCurveTo(-0.4, -0.34, -0.42, 0.02);
  shape.lineTo(-0.42, 0.36);
  shape.closePath();
  return extrude([shape], 0.3);
};

// In LAYERS order: one piece per piece of work, scaled to PIECE_HEIGHT and
// centred on its slot.
const pieceGeometries = () =>
  [databaseGeometry, migrationGeometry, workflowsGeometry, shieldGeometry].map(
    (build) => {
      const geometry = build();
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      const height = isDefined(box) ? box.max.y - box.min.y : PIECE_HEIGHT;
      geometry.center();
      geometry.scale(
        PIECE_HEIGHT / height,
        PIECE_HEIGHT / height,
        PIECE_HEIGHT / height,
      );
      return geometry;
    },
  );

// Under its workspace, unlike the tags placed above their point.
const BelowTag = styled(SceneTag)`
  transform: translate(var(--x), var(--y)) translate(-50%, 0) scale(var(--s, 1));
  transform-origin: 50% 0;
`;

export function IntegratorClientsScene() {
  const { i18n } = useLingui();
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const clientRefs = useRef<(HTMLDivElement | null)[]>([]);
  const totalRef = useRef<HTMLDivElement>(null);
  const totalValueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!isDefined(frame)) return;
    const stage = createHalftoneDotStage(frame, {
      cellPx: 7,
      fov: 28,
      shape: 'mixed',
    });
    if (!isDefined(stage)) return;
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // The desktop view; on a narrow banner the camera backs off along the
    // same line until the three clients, tags included, fits 90% of the width, as the apps hero does.
    const VIEW_FROM = new THREE.Vector3(0, 3.6, 9);
    const LOOK_AT = new THREE.Vector3(0, 1.1, 0);
    const SCENE_WIDTH = 10.5;
    const viewLine = VIEW_FROM.clone().sub(LOOK_AT);
    const halfHeight = Math.tan((stage.camera.fov / 2) * (Math.PI / 180));
    const distance = Math.max(
      viewLine.length(),
      SCENE_WIDTH / (0.9 * 2 * halfHeight * stage.camera.aspect),
    );
    stage.camera.position
      .copy(LOOK_AT)
      .add(viewLine.normalize().multiplyScalar(distance));
    stage.camera.lookAt(LOOK_AT);

    const plateGeometry = new RoundedBoxGeometry(
      PLATE_WIDTH,
      PLATE_HEIGHT,
      PLATE_DEPTH,
      4,
      0.1,
    );
    const geometries = pieceGeometries();
    // each client's plate and pieces; the pieces alternate in tone
    const plates = CLIENTS.map(() => {
      const material = createHalftoneToneMaterial(0.56, 0.36);
      const mesh = new THREE.Mesh(plateGeometry, material);
      mesh.position.set(0, -10, 0);
      stage.tone.add(mesh);
      return { mesh, material };
    });
    const stacks = CLIENTS.map(() =>
      LAYERS.map((_layer, index) => {
        const rest = index % 2 === 0 ? 0.48 : 0.64;
        const material = createHalftoneToneMaterial(rest, 0.36);
        const mesh = new THREE.Mesh(geometries[index], material);
        mesh.position.set(PIECE_X[index], -10, 0);
        stage.tone.add(mesh);
        return { mesh, material, rest };
      }),
    );
    const stackTop = PLATE_HEIGHT + PIECE_HEIGHT;

    let cycleStart = 0;
    let shownTotal = reducedMotion ? MONTHLY_TOTAL_USD : 0;
    const live = CLIENTS.map(() => (reducedMotion ? 1 : 0));
    const anchor = new THREE.Vector3();
    let animationFrame = 0;

    const render = (now: number) => {
      animationFrame = requestAnimationFrame(render);
      if (!stage.isVisible()) return;

      if (!reducedMotion && now - cycleStart > CYCLE_MS) {
        cycleStart = now;
        shownTotal = 0;
      }
      const time = reducedMotion
        ? PLATE_LEAD_MS + LAYERS.length * LAYER_MS + LIVE_MS / 2
        : now - cycleStart;

      const ray = stage.pointerRay();
      const hit = ray?.intersectObjects([
        ...plates.map((plate) => plate.mesh),
        ...stacks.flat().map((layer) => layer.mesh),
      ])[0];

      let total = 0;
      let landing: { client: number; layer: number; age: number } | null = null;
      CLIENTS.forEach((client, clientIndex) => {
        const clientStart = clientIndex * CLIENT_MS;
        const clientEnd = clientStart + CLIENT_MS;
        const onStage = time >= clientStart && time < clientEnd;
        const clearing = ease((time - (clientEnd - CLEAR_MS)) / CLEAR_MS);
        const hovered = [plates[clientIndex], ...stacks[clientIndex]].some(
          (part) => part.mesh === hit?.object,
        );

        const plate = plates[clientIndex];
        const plateDrop = easeOutBack((time - clientStart) / DROP_MS);
        plate.mesh.visible = onStage;
        plate.mesh.position.y =
          PLATE_HEIGHT / 2 +
          (1 - plateDrop) * DROP_HEIGHT -
          clearing * (PLATE_HEIGHT + 1);
        plate.mesh.scale.setScalar(1 - clearing * 0.4);

        stacks[clientIndex].forEach((layer, layerIndex) => {
          const dropStart = clientStart + PLATE_LEAD_MS + layerIndex * LAYER_MS;
          const drop = easeOutBack((time - dropStart) / DROP_MS);
          const landed = time >= dropStart;
          layer.mesh.visible = onStage && landed;
          layer.mesh.position.x = PIECE_X[layerIndex] * (1 - clearing * 0.4);
          layer.mesh.position.y =
            PLATE_HEIGHT +
            PIECE_HEIGHT / 2 +
            (1 - drop) * DROP_HEIGHT -
            clearing * (PLATE_HEIGHT + PIECE_HEIGHT + 1);
          layer.mesh.scale.setScalar(1 - clearing * 0.4);
          const flash = landed ? Math.max(0, 1 - (time - dropStart) / 700) : 0;
          const base = layer.rest + 0.12 * Math.max(flash, hovered ? 1 : 0);
          layer.material.uniforms.uBase.value +=
            (base - layer.material.uniforms.uBase.value) * 0.2;
          if (onStage && landed && time - dropStart < LAYER_MS) {
            landing = {
              client: clientIndex,
              layer: layerIndex,
              age: time - dropStart,
            };
          }
        });

        const liveAt = clientStart + PLATE_LEAD_MS + LAYERS.length * LAYER_MS;
        const isLive = time >= liveAt && time < clientEnd - CLEAR_MS / 2;
        live[clientIndex] +=
          ((isLive ? 1 : 0) - live[clientIndex]) * (reducedMotion ? 1 : 0.12);
        if (time >= liveAt + 300) total += shareOf(client.seats);

        const pill = clientRefs.current[clientIndex];
        if (isDefined(pill)) {
          anchor.set(0, 0, PLATE_DEPTH / 2 + 0.3);
          stage.place(
            pill,
            anchor,
            live[clientIndex],
            0.85 + 0.15 * live[clientIndex],
          );
        }
      });

      // the layer that just landed names itself above its stack
      layerRefs.current.forEach((element, index) => {
        if (!isDefined(element)) return;
        const current = landing as {
          client: number;
          layer: number;
          age: number;
        } | null;
        if (reducedMotion || current === null || current.layer !== index) {
          element.style.display = 'none';
          return;
        }
        const fade =
          ease(current.age / 200) * (1 - ease((current.age - 650) / 200));
        anchor.set(PIECE_X[current.layer], stackTop + 0.3, 0);
        stage.place(element, anchor, fade, 0.9 + 0.1 * fade);
      });

      if (reducedMotion) total = MONTHLY_TOTAL_USD;
      shownTotal += (total - shownTotal) * (reducedMotion ? 1 : 0.1);
      if (Math.abs(total - shownTotal) < 1) shownTotal = total;
      if (isDefined(totalRef.current)) {
        anchor.set(0, stackTop + 1.0, -1.6);
        stage.place(totalRef.current, anchor);
      }
      if (isDefined(totalValueRef.current)) {
        totalValueRef.current.textContent = USD.format(Math.round(shownTotal));
      }

      stage.render();
    };
    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      stage.dispose();
    };
  }, []);

  return (
    <SceneBanner aria-hidden ref={frameRef}>
      <SceneOverlay>
        {LAYERS.map((layer, index) => (
          <SceneTag
            data-secondary=""
            key={layer.name.id}
            ref={(element) => {
              layerRefs.current[index] = element;
            }}
          >
            <TagPill>
              <TagMark data-accent="">{String(index + 1)}</TagMark>
              <TagName>{i18n._(layer.name)}</TagName>
              <TagDetail>{i18n._(layer.detail)}</TagDetail>
            </TagPill>
          </SceneTag>
        ))}
        {CLIENTS.map((client, index) => (
          <BelowTag
            data-secondary=""
            key={client.initials}
            ref={(element) => {
              clientRefs.current[index] = element;
            }}
          >
            <TagPill>
              <TagMark>{client.initials}</TagMark>
              <TagName>{client.name}</TagName>
              <TagDetail>{i18n._(msg`Live · ${client.seats} seats`)}</TagDetail>
            </TagPill>
          </BelowTag>
        ))}
        <SceneTag ref={totalRef}>
          <TagPill>
            <TagMark data-accent="">$</TagMark>
            <TagName ref={totalValueRef}>{USD.format(0)}</TagName>
            <TagDetail>{i18n._(msg`Your 20% each month`)}</TagDetail>
          </TagPill>
        </SceneTag>
      </SceneOverlay>
    </SceneBanner>
  );
}
