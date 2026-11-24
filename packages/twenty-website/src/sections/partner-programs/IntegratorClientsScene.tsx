'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
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
  { name: 'Acme Corp', initials: 'AC', seats: 40, x: -4.6 },
  { name: 'Northwind Studio', initials: 'NS', seats: 25, x: 0 },
  { name: 'Globex', initials: 'GL', seats: 10, x: 4.6 },
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

const LAYER_SIZE = 2.5;
const LAYER_HEIGHT = 0.34;
const LAYER_GAP = 0.12;
const DROP_HEIGHT = 2.6;

// One cycle: each client's layers land in turn, the client goes live, then
// the three hold before the workspaces clear and it starts over.
const LAYER_MS = 850;
const DROP_MS = 600;
const CLIENT_MS = LAYERS.length * LAYER_MS + 900;
const HOLD_MS = 3600;
const CLEAR_MS = 500;
const CYCLE_MS = CLIENTS.length * CLIENT_MS + HOLD_MS;

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

// Under its workspace, unlike the tags placed above their point.
const BelowTag = styled(SceneTag)`
  transform: translate(var(--x), var(--y)) translate(-50%, 0)
    scale(var(--s, 1));
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

    stage.camera.position.set(0, 5.6, 10.5);
    stage.camera.lookAt(0, 0.3, 0);

    const geometry = new RoundedBoxGeometry(
      LAYER_SIZE,
      LAYER_HEIGHT,
      LAYER_SIZE,
      4,
      0.12,
    );
    // each client's stack; layers alternate in tone so they read apart
    const stacks = CLIENTS.map((client) =>
      LAYERS.map((_layer, index) => {
        const rest = index % 2 === 0 ? 0.48 : 0.64;
        const material = createHalftoneToneMaterial(rest, 0.36);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(client.x, -10, 0);
        stage.tone.add(mesh);
        return { mesh, material, rest };
      }),
    );
    const layerY = (index: number) =>
      LAYER_HEIGHT / 2 + index * (LAYER_HEIGHT + LAYER_GAP);
    const stackTop = layerY(LAYERS.length - 1) + LAYER_HEIGHT / 2;

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
      const time = reducedMotion ? CYCLE_MS - CLEAR_MS - 1 : now - cycleStart;
      const clearing = ease((time - (CYCLE_MS - CLEAR_MS)) / CLEAR_MS);

      const ray = stage.pointerRay();
      const hit = ray?.intersectObjects(
        stacks.flat().map((layer) => layer.mesh),
      )[0];

      let total = 0;
      let landing: { client: number; layer: number; age: number } | null =
        null;
      CLIENTS.forEach((client, clientIndex) => {
        const clientStart = clientIndex * CLIENT_MS;
        const hovered = stacks[clientIndex].some(
          (layer) => layer.mesh === hit?.object,
        );
        stacks[clientIndex].forEach((layer, layerIndex) => {
          const dropStart = clientStart + layerIndex * LAYER_MS;
          const drop = easeOutBack((time - dropStart) / DROP_MS);
          const landed = time >= dropStart;
          layer.mesh.visible = landed && clearing < 1;
          layer.mesh.position.y =
            layerY(layerIndex) +
            (1 - drop) * DROP_HEIGHT -
            clearing * (layerY(layerIndex) + LAYER_HEIGHT);
          layer.mesh.scale.setScalar(1 - clearing * 0.4);
          const flash = landed ? Math.max(0, 1 - (time - dropStart) / 700) : 0;
          const base =
            layer.rest + 0.12 * Math.max(flash, hovered ? 1 : 0);
          layer.material.uniforms.uBase.value +=
            (base - layer.material.uniforms.uBase.value) * 0.2;
          if (
            landed &&
            time - dropStart < LAYER_MS &&
            time < clientStart + LAYERS.length * LAYER_MS
          ) {
            landing = {
              client: clientIndex,
              layer: layerIndex,
              age: time - dropStart,
            };
          }
        });

        const liveAt = clientStart + LAYERS.length * LAYER_MS;
        const isLive = time >= liveAt && clearing < 0.5;
        live[clientIndex] +=
          ((isLive ? 1 : 0) - live[clientIndex]) * (reducedMotion ? 1 : 0.12);
        if (time >= liveAt + 300) total += shareOf(client.seats);

        const pill = clientRefs.current[clientIndex];
        if (isDefined(pill)) {
          anchor.set(client.x, 0, LAYER_SIZE / 2 + 0.3);
          stage.place(pill, anchor, live[clientIndex], 0.85 + 0.15 * live[clientIndex]);
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
        anchor.set(CLIENTS[current.client].x, stackTop + 0.4, 0);
        stage.place(element, anchor, fade, 0.9 + 0.1 * fade);
      });

      if (!reducedMotion && clearing > 0) total = MONTHLY_TOTAL_USD;
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
