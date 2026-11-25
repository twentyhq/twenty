'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { isDefined } from 'twenty-shared/utils';

import {
  createHalftoneDotStage,
  createHalftoneToneMaterial,
} from '@/platform/visuals/halftone-dots/create-halftone-dot-stage';
import {
  SceneBanner,
  SceneLabel,
  SceneOverlay,
  SceneTag,
  TagDetail,
  TagMark,
  TagName,
  TagPill,
} from '@/platform/visuals/halftone-dots/halftone-dot-scene-parts';
import { paletteColorNumber } from '@/tokens';

// The creators hero, read left to right as the page tells it. Clicks come
// from where you post into your link; teams sign up through it and keep
// their seats on show; each one sends your 20% back to the link, where the
// monthly total adds up. The figures are the Earnings step's
// (CommissionStepVisual): 20% of the $39 seat, so 40 + 25 + 10 seats make
// $585 a month.
const SEAT_PRICE_USD = 39;
const COMMISSION_SHARE = 0.2;
// Illustrative: the page doesn't show the real link format.
const LINK_TEXT = 'twenty.com/?via=you';

type NodeKey =
  | 'link'
  | 'youtube'
  | 'newsletter'
  | 'community'
  | 'acme'
  | 'northwind'
  | 'globex';

const NODES: readonly {
  key: NodeKey;
  at: readonly [number, number];
  size: readonly [number, number, number];
}[] = [
  { key: 'link', at: [0, 0.2], size: [2.2, 0.7, 2.2] },
  { key: 'youtube', at: [-4.2, -2.0], size: [1.3, 0.4, 1.3] },
  { key: 'newsletter', at: [-5.7, 0.6], size: [1.3, 0.4, 1.3] },
  { key: 'community', at: [-4.1, 3.3], size: [1.3, 0.4, 1.3] },
  { key: 'acme', at: [4.2, -2.0], size: [1.5, 0.5, 1.5] },
  { key: 'northwind', at: [5.7, 0.6], size: [1.5, 0.5, 1.5] },
  { key: 'globex', at: [4.1, 3.3], size: [1.5, 0.5, 1.5] },
];

const CHANNELS = [
  { key: 'youtube' as const, label: 'YouTube' },
  { key: 'newsletter' as const, label: msg`Newsletter` },
  { key: 'community' as const, label: msg`Community` },
];

const TEAMS = [
  { key: 'acme' as const, name: 'Acme Corp', initials: 'AC', seats: 40 },
  {
    key: 'northwind' as const,
    name: 'Northwind Studio',
    initials: 'NS',
    seats: 25,
  },
  { key: 'globex' as const, name: 'Globex', initials: 'GL', seats: 10 },
];

const shareOf = (seats: number) =>
  Math.round(seats * SEAT_PRICE_USD * COMMISSION_SHARE);
const MONTHLY_TOTAL_USD = TEAMS.reduce(
  (total, team) => total + shareOf(team.seats),
  0,
);

const USD = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
});

// One cycle: each team signs up in turn (signup out, share back), then the
// full total holds before the cycle starts over.
const CLICK_EVERY_MS = 420;
const TRAVEL_MS = 1400;
const TEAM_SLOT_MS = 3200;
const HOLD_MS = 3200;
const CYCLE_MS = TEAMS.length * TEAM_SLOT_MS + HOLD_MS;

// Under its block, unlike the tags placed above their point.
const BelowTag = styled(SceneTag)`
  transform: translate(var(--x), var(--y)) translate(-50%, 0) scale(var(--s, 1));
  transform-origin: 50% 0;
`;

type Packet = {
  mesh: THREE.Mesh;
  start: number;
  reverse: boolean;
};

export function CreatorReferralScene() {
  const { i18n } = useLingui();
  const frameRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Partial<Record<NodeKey, HTMLDivElement | null>>>({});
  const seatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const linkRef = useRef<HTMLDivElement>(null);
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
    // same line until the scene, tags included, fits 90% of the width, as the apps hero does.
    const VIEW_FROM = new THREE.Vector3(0, 6.1, 9.4);
    const LOOK_AT = new THREE.Vector3(0, -1.1, 0.6);
    const SCENE_WIDTH = 15;
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

    const solids = NODES.map((node) => {
      const isLink = node.key === 'link';
      const rest = isLink ? 0.6 : 0.5;
      const material = createHalftoneToneMaterial(rest, isLink ? 0.38 : 0.42);
      const [width, height, depth] = node.size;
      const mesh = new THREE.Mesh(
        new RoundedBoxGeometry(width, height, depth, 4, 0.22),
        material,
      );
      mesh.position.set(node.at[0], height / 2, node.at[1]);
      stage.tone.add(mesh);
      return { node, mesh, material, rest, glow: 0 };
    });
    const solidOf = (key: NodeKey) =>
      solids.find((solid) => solid.node.key === key)!;
    const topOf = (key: NodeKey) =>
      solidOf(key).mesh.position.clone().setY(solidOf(key).node.size[1]);

    // clicks into the link; signups out of it, shares back along the same arc
    const blue = paletteColorNumber('blue');
    const routes = [
      ...CHANNELS.map((channel) => [channel.key, 'link'] as const),
      ...TEAMS.map((team) => ['link', team.key] as const),
    ].map(([from, to]) => {
      const start = topOf(from);
      const end = topOf(to);
      const middle = start.clone().lerp(end, 0.5).setY(1.6);
      const curve = new THREE.QuadraticBezierCurve3(start, middle, end);
      const geometry = new LineGeometry();
      geometry.setPositions(
        curve.getPoints(64).flatMap((point) => [point.x, point.y, point.z]),
      );
      stage.crisp.add(
        new Line2(
          geometry,
          new LineMaterial({
            color: blue,
            linewidth: 1.4,
            opacity: 0.55,
            resolution: stage.lineResolution,
            transparent: true,
          }),
        ),
      );
      return { from, to, curve, packets: [] as Packet[] };
    });
    type Route = (typeof routes)[number];
    const routeFrom = (key: NodeKey) =>
      routes.find((route) => route.from === key)!;
    const routeTo = (key: NodeKey) => routes.find((route) => route.to === key)!;

    // a click is a small dot; a share coming back is a larger ringed one
    const clickGeometry = new THREE.SphereGeometry(0.07, 16, 12);
    const shareGeometry = new THREE.SphereGeometry(0.13, 20, 16);
    const packetMaterial = new THREE.MeshBasicMaterial({ color: blue });
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.BackSide,
    });
    const launch = (route: Route, now: number, kind: 'click' | 'share') => {
      const mesh = new THREE.Mesh(
        kind === 'share' ? shareGeometry : clickGeometry,
        packetMaterial,
      );
      if (kind === 'share') {
        const ring = new THREE.Mesh(shareGeometry, ringMaterial);
        ring.scale.setScalar(1.35);
        mesh.add(ring);
      }
      stage.crisp.add(mesh);
      route.packets.push({ mesh, start: now, reverse: kind === 'share' });
    };

    const joined = TEAMS.map(() => (reducedMotion ? 1 : 0));
    const fired = new Set<string>();
    let cycleStart = 0;
    let shownTotal = reducedMotion ? MONTHLY_TOTAL_USD : 0;
    let lastClick = 0;
    const anchor = new THREE.Vector3();
    let animationFrame = 0;

    const render = (now: number) => {
      animationFrame = requestAnimationFrame(render);
      if (!stage.isVisible()) return;

      // the cycle: when each team signs up and when its share lands
      let total = MONTHLY_TOTAL_USD;
      const joinedTarget = TEAMS.map(() => 1);
      if (!reducedMotion) {
        if (now - cycleStart > CYCLE_MS) {
          cycleStart = now;
          fired.clear();
          shownTotal = 0;
        }
        const time = now - cycleStart;
        total = 0;
        TEAMS.forEach((team, index) => {
          const slot = index * TEAM_SLOT_MS;
          const signupKey = `signup-${index}`;
          const shareKey = `share-${index}`;
          if (time >= slot && !fired.has(signupKey)) {
            fired.add(signupKey);
            launch(routeTo(team.key), now, 'click');
          }
          if (time >= slot + TRAVEL_MS && !fired.has(shareKey)) {
            fired.add(shareKey);
            launch(routeTo(team.key), now, 'share');
          }
          joinedTarget[index] = time >= slot + TRAVEL_MS ? 1 : 0;
          if (time >= slot + 2 * TRAVEL_MS) total += shareOf(team.seats);
        });
        // everything fades out just before the cycle starts over
        if (time > CYCLE_MS - 400) {
          joinedTarget.fill(0);
        }

        if (now - lastClick > CLICK_EVERY_MS) {
          const channel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)];
          launch(routeFrom(channel.key), now, 'click');
          lastClick = now;
        }
      }

      routes.forEach((route) => {
        for (let index = route.packets.length - 1; index >= 0; index--) {
          const packet = route.packets[index];
          const progress = (now - packet.start) / TRAVEL_MS;
          if (progress >= 1) {
            stage.crisp.remove(packet.mesh);
            route.packets.splice(index, 1);
            solidOf(packet.reverse ? route.from : route.to).glow = 1;
            continue;
          }
          packet.mesh.position.copy(
            route.curve.getPoint(packet.reverse ? 1 - progress : progress),
          );
        }
      });

      const ray = stage.pointerRay();
      const hit = ray?.intersectObjects(solids.map((solid) => solid.mesh))[0];
      const hovered = solids.find((solid) => solid.mesh === hit?.object);

      solids.forEach((solid) => {
        solid.glow *= 0.94;
        const teamIndex = TEAMS.findIndex(
          (team) => team.key === solid.node.key,
        );
        const settled = teamIndex >= 0 ? joined[teamIndex] * 0.6 : 0;
        const lift = Math.max(solid.glow, settled, solid === hovered ? 1 : 0);
        const base = solid.rest + 0.12 * lift;
        solid.material.uniforms.uBase.value +=
          (base - solid.material.uniforms.uBase.value) * 0.15;
        solid.mesh.position.y =
          solid.node.size[1] / 2 + (solid === hovered ? 0.25 : 0);
        const label = labelRefs.current[solid.node.key];
        if (isDefined(label)) {
          anchor
            .copy(solid.mesh.position)
            .setY(0)
            .add(new THREE.Vector3(0, 0, solid.node.size[2] / 2 + 0.22));
          // a team that signed up swaps its name for its pill
          stage.place(
            label,
            anchor,
            teamIndex >= 0 ? 1 - joined[teamIndex] : 1,
          );
        }
      });

      // teams that signed up keep their seats on show
      TEAMS.forEach((team, index) => {
        joined[index] +=
          (joinedTarget[index] - joined[index]) * (reducedMotion ? 1 : 0.12);
        const element = seatRefs.current[index];
        if (!isDefined(element)) return;
        const solid = solidOf(team.key);
        anchor
          .copy(solid.mesh.position)
          .setY(0)
          .add(new THREE.Vector3(0, 0, solid.node.size[2] / 2 + 0.22));
        stage.place(
          element,
          anchor,
          joined[index],
          0.85 + 0.15 * joined[index],
        );
      });

      // the link, and the monthly total it collects
      const link = solidOf('link');
      if (isDefined(linkRef.current)) {
        anchor.copy(link.mesh.position).setY(link.node.size[1] + 0.35);
        stage.place(linkRef.current, anchor);
      }
      shownTotal += (total - shownTotal) * (reducedMotion ? 1 : 0.1);
      if (isDefined(totalRef.current)) {
        anchor
          .copy(link.mesh.position)
          .setY(0)
          .add(new THREE.Vector3(0, 0, link.node.size[2] / 2 + 0.3));
        stage.place(totalRef.current, anchor);
      }
      if (isDefined(totalValueRef.current)) {
        if (Math.abs(total - shownTotal) < 1) shownTotal = total;
        totalValueRef.current.textContent = USD.format(Math.round(shownTotal));
      }

      stage.render();
    };
    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      clickGeometry.dispose();
      shareGeometry.dispose();
      packetMaterial.dispose();
      ringMaterial.dispose();
      stage.dispose();
    };
  }, []);

  return (
    <SceneBanner aria-hidden ref={frameRef}>
      <SceneOverlay>
        {CHANNELS.map((channel) => (
          <SceneLabel
            data-secondary=""
            key={channel.key}
            ref={(element) => {
              labelRefs.current[channel.key] = element;
            }}
          >
            {typeof channel.label === 'string'
              ? channel.label
              : i18n._(channel.label)}
          </SceneLabel>
        ))}
        {TEAMS.map((team) => (
          <SceneLabel
            data-secondary=""
            key={team.key}
            ref={(element) => {
              labelRefs.current[team.key] = element;
            }}
          >
            {team.name}
          </SceneLabel>
        ))}
        {TEAMS.map((team, index) => (
          <BelowTag
            data-secondary=""
            key={`seats-${team.key}`}
            ref={(element) => {
              seatRefs.current[index] = element;
            }}
          >
            <TagPill>
              <TagMark>{team.initials}</TagMark>
              <TagName>{team.name}</TagName>
              <TagDetail>{i18n._(msg`${team.seats} seats`)}</TagDetail>
            </TagPill>
          </BelowTag>
        ))}
        <SceneTag ref={linkRef}>
          <TagPill>
            <TagMark data-accent="">↗</TagMark>
            <TagName>{LINK_TEXT}</TagName>
          </TagPill>
        </SceneTag>
        <BelowTag ref={totalRef}>
          <TagPill>
            <TagMark data-accent="">$</TagMark>
            <TagName ref={totalValueRef}>{USD.format(0)}</TagName>
            <TagDetail>{i18n._(msg`Your 20% each month`)}</TagDetail>
          </TagPill>
        </BelowTag>
      </SceneOverlay>
    </SceneBanner>
  );
}
