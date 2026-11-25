'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { isDefined } from 'twenty-shared/utils';

import { DISCORD_PATH, TWENTY_MARK_PATH } from '@/icons';
import { useMenuStyleWriter } from '@/platform/menu-style';
import {
  createHalftoneDotStage,
  createHalftoneToneMaterial,
} from '@/platform/visuals/halftone-dots/create-halftone-dot-stage';
import {
  SceneOverlay,
  SceneTag,
  TagDetail,
  TagName,
  TagPill,
} from '@/platform/visuals/halftone-dots/halftone-dot-scene-parts';
import {
  color,
  MENU_HEIGHT_PX,
  paletteColorNumber,
  semanticColor,
} from '@/tokens';

// The creators hero: a wall of badges in the home's halftone, seen straight
// on, as the integrators hero shows its blueprint. The wall is blank and
// light, tone on tone; along the bottom row the program reads left to
// right: the channels you post on, Twenty (your link), the teams that sign
// up through it. Clicks run from the channels into Twenty; each team that
// signs up sends your 20% back, and the monthly total adds up under Twenty.
// The figures are the Earnings step's (CommissionStepVisual): 20% of the
// $39 seat, so 40 + 25 + 10 seats make $585 a month.
const SEAT_PRICE_USD = 39;
const COMMISSION_SHARE = 0.2;

// The bottom row sits where the other heroes' banner does (its height, the
// same scale, as the integrators hero); the wall carries on above it,
// behind the copy.
const FOV = 28;
// the halftone's cell, in CSS pixels from the frame's bottom left
const CELL_PX = 5;
const BANNER_UNITS = { wide: 8, narrow: 7.6 };
const bannerPx = (width: number) => Math.min(Math.max(0.36 * width, 202), 396);

// The wall: badges on a square grid, one unit high
const PITCH = 1.9;
const BADGE_HEIGHT = 1.25;
const BADGE_DEPTH = 0.22;
const WALL = { columns: 12, rowsBelow: 2, rowsAbove: 8 };
// a blank badge is lighter than the row's, tone on tone
const TONE = { wall: 0.45, row: 0.85 };

type NodeKey =
  | 'link'
  | 'youtube'
  | 'newsletter'
  | 'community'
  | 'acme'
  | 'northwind'
  | 'globex';

// a silhouette is flat, without a badge's bevel: a little taller to weigh
// the same
const PERSON_HEIGHT = 1.45;

// The bottom row, in grid columns; Twenty is larger and takes three
const NODES: readonly { key: NodeKey; column: number; height: number }[] = [
  { key: 'youtube', column: -4, height: BADGE_HEIGHT },
  { key: 'newsletter', column: -3, height: BADGE_HEIGHT },
  { key: 'community', column: -2, height: BADGE_HEIGHT },
  { key: 'link', column: 0, height: 2 },
  { key: 'acme', column: 2, height: PERSON_HEIGHT },
  { key: 'northwind', column: 3, height: PERSON_HEIGHT },
  { key: 'globex', column: 4, height: PERSON_HEIGHT },
];
// the row's width, edges included, which a narrow screen must fit
const ROW_UNITS = 8 * PITCH + 1.3 * BADGE_HEIGHT;

const CHANNELS = ['youtube', 'newsletter', 'community'] as const;

const TEAMS = [
  { key: 'acme' as const, seats: 40 },
  { key: 'northwind' as const, seats: 25 },
  { key: 'globex' as const, seats: 10 },
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

// The hero's backdrop: the wall fills it, light under the menu and behind
// the copy, fading out at the sides (the integrators hero's mask).
const Backdrop = styled.div`
  inset: 0;
  mask-composite: intersect;
  mask-image:
    radial-gradient(
      ellipse 42% 34% at 50% 26%,
      color-mix(in srgb, ${color('black')} 14%, transparent) 45%,
      black 100%
    ),
    linear-gradient(to right, transparent, black 12%, black 88%, transparent),
    linear-gradient(
      to bottom,
      color-mix(in srgb, ${color('black')} 25%, transparent) ${MENU_HEIGHT_PX}px,
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

// Under Twenty, unlike the tags placed above their point.
const BelowTag = styled(SceneTag)`
  transform: translate(var(--x), var(--y)) translate(-50%, 0) scale(var(--s, 1));
  transform-origin: 50% 0;
`;

// The badges, drawn one unit high: a rounded rectangle in the halftone,
// its mark laid on its face in sharp white, as on an app icon (never
// halftone on halftone: the dots can't hold a mark's thin strokes).
const roundedRect = (width: number, height: number, radius: number) => {
  const x = width / 2;
  const y = height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-x + radius, -y);
  shape.lineTo(x - radius, -y);
  shape.quadraticCurveTo(x, -y, x, -y + radius);
  shape.lineTo(x, y - radius);
  shape.quadraticCurveTo(x, y, x - radius, y);
  shape.lineTo(-x + radius, y);
  shape.quadraticCurveTo(-x, y, -x, y - radius);
  shape.lineTo(-x, -y + radius);
  shape.quadraticCurveTo(-x, -y, -x + radius, -y);
  return shape;
};

const polygonShape = (points: readonly (readonly [number, number])[]) =>
  new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));

// An SVG mark from the site's icons, y up, centered and fitted to a height
const svgMark = (path: string, height: number) => {
  const shapes = new SVGLoader()
    .parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${path}"/></svg>`)
    .paths.flatMap((svgPath) => SVGLoader.createShapes(svgPath));
  const bounds = new THREE.Box2().setFromPoints(
    shapes.flatMap((shape) => shape.getPoints(12)),
  );
  const center = bounds.getCenter(new THREE.Vector2());
  const scale = height / (bounds.max.y - bounds.min.y);
  const fit = (points: THREE.Vector2[]) =>
    points.map(
      (point) =>
        new THREE.Vector2(
          (point.x - center.x) * scale,
          -(point.y - center.y) * scale,
        ),
    );
  return shapes.map((shape) => {
    const fitted = new THREE.Shape(fit(shape.getPoints(12)));
    shape.holes.forEach((hole) =>
      fitted.holes.push(new THREE.Path(fit(hole.getPoints(12)))),
    );
    return fitted;
  });
};

// A person: a round head, a clear gap, then the shoulders (the top half of
// an ellipse). The gap is wide enough (about three cells) for the halftone
// to keep it open, even with the dots swollen under the cursor.
const personShapes = () => {
  const head = new THREE.Shape().absarc(0, 0.33, 0.19, 0, Math.PI * 2, false);
  const shoulders = new THREE.Shape();
  shoulders.moveTo(0.36, -0.42);
  shoulders.absellipse(0, -0.42, 0.36, 0.34, 0, Math.PI, false);
  shoulders.closePath();
  return [head, shoulders];
};

type Badge = {
  width: number;
  radius: number;
  mark?: () => THREE.Shape[];
  // the mark alone, in volume, without its rounded rectangle
  bare?: true;
};

const BLANK_BADGE: Badge = { radius: 0.24, width: 1 };

// A team that signs up: a person standing on their own, not in a badge
const TEAM_BADGE: Badge = {
  bare: true,
  mark: personShapes,
  radius: 0,
  width: 1,
};

const BADGES: Record<NodeKey, Badge> = {
  // YouTube's own rounded rectangle and its play triangle
  youtube: {
    mark: () => [
      polygonShape([
        [-0.17, -0.25],
        [0.3, 0],
        [-0.17, 0.25],
      ]),
    ],
    radius: 0.3,
    width: 1.3,
  },
  // an envelope, its flap a V
  newsletter: {
    mark: () => [
      polygonShape([
        [-0.46, 0.3],
        [0, -0.04],
        [0.46, 0.3],
        [0.46, 0.2],
        [0, -0.14],
        [-0.46, 0.2],
      ]),
    ],
    radius: 0.12,
    width: 1.15,
  },
  community: {
    mark: () => svgMark(DISCORD_PATH, 0.46),
    radius: 0.24,
    width: 1,
  },
  // Twenty's square (rx 4 on 40) and its mark, as in TwentyLogo
  link: {
    mark: () => svgMark(TWENTY_MARK_PATH, 0.505),
    radius: 0.1,
    width: 1,
  },
  acme: TEAM_BADGE,
  northwind: TEAM_BADGE,
  globex: TEAM_BADGE,
};

const createBadgeGeometry = (badge: Badge, height: number) => {
  // a bare mark lies flat, facing the camera: with no depth, no side of it
  // shows, so the same mark screens the same wherever it sits on the row
  if (isDefined(badge.bare) && isDefined(badge.mark)) {
    const flat = new THREE.ShapeGeometry(badge.mark(), 24);
    flat.center();
    flat.scale(height, height, height);
    return flat;
  }
  const depth = BADGE_DEPTH / BADGE_HEIGHT;
  const bevel = depth * 0.22;
  const geometry = new THREE.ExtrudeGeometry(
    roundedRect(badge.width, 1, badge.radius),
    {
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: bevel,
      bevelThickness: bevel,
      curveSegments: 16,
      depth: depth - 2 * bevel,
    },
  );
  geometry.center();
  geometry.scale(height, height, height);
  return geometry;
};

// the mark, just in front of the badge's face
const createMarkGeometry = (badge: Badge, height: number) => {
  const geometry = new THREE.ShapeGeometry(badge.mark?.() ?? [], 12);
  geometry.translate(0, 0, BADGE_DEPTH / BADGE_HEIGHT / 2 + 0.01);
  geometry.scale(height, height, height);
  return geometry;
};

// Which wall cells stay empty, picked from their place so it is stable
const isGap = (column: number, row: number) =>
  Math.abs((column * 7 + row * 3 + column * row) % 9) === 0;

type Packet = {
  mesh: THREE.Mesh;
  start: number;
  reverse: boolean;
};

export function CreatorReferralScene() {
  const { i18n } = useLingui();
  const frameRef = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLDivElement>(null);
  const totalValueRef = useRef<HTMLSpanElement>(null);
  const setMenuBackground = useMenuStyleWriter()?.setBackground;

  // The wall runs up under the menu: the menu lets it show at the top of
  // the page and takes the hero's own surface over the first scroll. The
  // menu's background is set from the page root, where the surface token is
  // the default one, so the hero's colour is read from the hero itself
  // (grey on a muted hero, white on a light one).
  useEffect(() => {
    if (!isDefined(setMenuBackground)) return;
    const hero = frameRef.current?.closest('section');
    const surface = isDefined(hero)
      ? getComputedStyle(hero).backgroundColor
      : semanticColor.surface;
    const update = () => {
      const opaque = Math.min(Math.max(window.scrollY / MENU_HEIGHT_PX, 0), 1);
      setMenuBackground(
        `color-mix(in srgb, ${surface} ${Math.round(opaque * 100)}%, transparent)`,
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
    const stage = createHalftoneDotStage(frame, {
      cellPx: CELL_PX,
      fov: FOV,
    });
    if (!isDefined(stage)) return;
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const halfFov = Math.tan((FOV / 2) * (Math.PI / 180));
    const disposables: { dispose: () => void }[] = [];

    // the blank wall, set back a little so the routes pass in front of it
    const wallMaterial = createHalftoneToneMaterial(TONE.wall, 0);
    const wallGeometry = createBadgeGeometry(BLANK_BADGE, BADGE_HEIGHT);
    disposables.push(wallMaterial, wallGeometry);
    const rowColumns = new Set(
      NODES.flatMap((node) =>
        node.key === 'link'
          ? [node.column - 1, node.column, node.column + 1]
          : [node.column],
      ),
    );
    for (let row = -WALL.rowsBelow; row <= WALL.rowsAbove; row++) {
      for (let column = -WALL.columns; column <= WALL.columns; column++) {
        if (row === 0 && rowColumns.has(column)) continue;
        // room for the total under Twenty
        if (row === -1 && Math.abs(column) <= 1) continue;
        if (isGap(column, row)) continue;
        const mesh = new THREE.Mesh(wallGeometry, wallMaterial);
        mesh.position.set(column * PITCH, row * PITCH, -0.4);
        stage.tone.add(mesh);
      }
    }

    // A field of dots too faint to show at rest, behind the wall: the
    // cursor's lift brings them up around it, so the whole wall answers the
    // pointer (the integrators hero's field)
    const fieldMaterial = createHalftoneToneMaterial(0.4, 0);
    const fieldGeometry = new THREE.PlaneGeometry(PITCH * 30, PITCH * 16);
    disposables.push(fieldMaterial, fieldGeometry);
    const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
    field.position.set(0, PITCH * 3, -0.6);
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

    // the bottom row: its badges, in the row's tone, with their marks
    const markMaterial = new THREE.MeshBasicMaterial({
      color: paletteColorNumber('white'),
    });
    disposables.push(markMaterial);
    const solids = NODES.map((node) => {
      const badge = BADGES[node.key];
      const material = createHalftoneToneMaterial(TONE.row, 0);
      const geometry = createBadgeGeometry(badge, node.height);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(node.column * PITCH, 0, 0);
      stage.tone.add(mesh);
      disposables.push(material, geometry);
      // a bare mark is its own volume, with nothing laid on it
      if (!isDefined(badge.bare)) {
        const mark = new THREE.Mesh(
          createMarkGeometry(badge, node.height),
          markMaterial,
        );
        mark.position.copy(mesh.position);
        stage.crisp.add(mark);
        disposables.push(mark.geometry);
      }
      geometry.computeBoundingBox();
      const top = geometry.boundingBox?.max.y ?? node.height / 2;
      return { node, mesh, material, top, glow: 0 };
    });
    const solidOf = (key: NodeKey) =>
      solids.find((solid) => solid.node.key === key)!;
    const topOf = (key: NodeKey) =>
      new THREE.Vector3(
        solidOf(key).mesh.position.x,
        solidOf(key).top,
        BADGE_DEPTH,
      );

    // One cable each side, as a harness: each badge's wire rises, turns
    // toward Twenty and joins the others on a bus above the row; from the
    // junction a single thicker cable runs into Twenty's flank. Clicks come
    // in along the channels' side; signups go out along the teams' side and
    // the shares come back along it.
    const blue = paletteColorNumber('blue');
    const drawLine = (curve: THREE.Curve<THREE.Vector3>, linewidth: number) => {
      const geometry = new LineGeometry();
      geometry.setPositions(
        curve.getPoints(64).flatMap((point) => [point.x, point.y, point.z]),
      );
      const material = new LineMaterial({
        color: blue,
        linewidth,
        opacity: 0.55,
        resolution: stage.lineResolution,
        transparent: true,
      });
      disposables.push(geometry, material);
      stage.crisp.add(new Line2(geometry, material));
    };
    const CABLE = { busY: 1.25, junctionX: 2.7, flankY: 0.15, bend: 0.45 };
    const twentyHalf = solidOf('link').node.height / 2;
    // the trunk, from the junction into Twenty's flank, on one side
    const trunkOf = (side: number) => {
      const inward = -side;
      const junction = new THREE.Vector3(
        side * CABLE.junctionX,
        CABLE.busY,
        BADGE_DEPTH,
      );
      const flank = new THREE.Vector3(
        side * twentyHalf,
        CABLE.flankY,
        BADGE_DEPTH,
      );
      return new THREE.CubicBezierCurve3(
        junction,
        new THREE.Vector3(junction.x + inward * 0.6, CABLE.busY, BADGE_DEPTH),
        new THREE.Vector3(flank.x - inward * 0.6, CABLE.flankY, BADGE_DEPTH),
        flank,
      );
    };
    const trunks = { left: trunkOf(-1), right: trunkOf(1) };
    drawLine(trunks.left, 2.6);
    drawLine(trunks.right, 2.6);
    // a badge's wire, from its top to the junction
    const wireOf = (key: NodeKey) => {
      const top = topOf(key);
      const side = Math.sign(top.x);
      const turn = new THREE.Vector3(
        top.x - side * CABLE.bend,
        CABLE.busY,
        BADGE_DEPTH,
      );
      const wire = new THREE.CurvePath<THREE.Vector3>();
      wire.add(
        new THREE.QuadraticBezierCurve3(
          top,
          new THREE.Vector3(top.x, CABLE.busY, BADGE_DEPTH),
          turn,
        ),
      );
      wire.add(
        new THREE.LineCurve3(
          turn,
          new THREE.Vector3(side * CABLE.junctionX, CABLE.busY, BADGE_DEPTH),
        ),
      );
      drawLine(wire, 1.4);
      return wire;
    };
    const routes = [
      ...CHANNELS.map((channel) => [channel, 'link'] as const),
      ...TEAMS.map((team) => ['link', team.key] as const),
    ].map(([from, to]) => {
      const badge = from === 'link' ? to : from;
      const wire = wireOf(badge);
      const trunk = from === 'link' ? trunks.right : trunks.left;
      // always walked from the badge to Twenty; a route out of Twenty runs
      // it backwards
      const path = new THREE.CurvePath<THREE.Vector3>();
      path.add(wire);
      path.add(trunk);
      const curve = {
        getPoint: (t: number) => path.getPoint(from === 'link' ? 1 - t : t),
      };
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
      color: paletteColorNumber('white'),
      side: THREE.BackSide,
    });
    disposables.push(
      clickGeometry,
      shareGeometry,
      packetMaterial,
      ringMaterial,
    );
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

    const fired = new Set<string>();
    let cycleStart = 0;
    let shownTotal = reducedMotion ? MONTHLY_TOTAL_USD : 0;
    let lastClick = 0;
    const anchor = new THREE.Vector3();
    let animationFrame = 0;

    const render = (now: number) => {
      animationFrame = requestAnimationFrame(render);
      if (!stage.isVisible()) return;

      // a flat wall seen straight on; the row sits mid-banner, at the
      // bottom of the hero, and the wall fills the rest of its height. A
      // narrow screen backs off until the row fits.
      const width = Math.max(frame.clientWidth, 1);
      const units = width < 768 ? BANNER_UNITS.narrow : BANNER_UNITS.wide;
      const pxPerUnit = Math.min(
        bannerPx(width) / units,
        // inside the mask's fade at the sides (12% each)
        (0.76 * width) / ROW_UNITS,
      );
      const viewHeight = Math.max(frame.clientHeight, 1) / pxPerUnit;
      const lookY = viewHeight / 2 - bannerPx(width) / pxPerUnit / 2;
      stage.camera.position.set(0, lookY, viewHeight / 2 / halfFov);
      stage.camera.lookAt(0, lookY, 0);

      // each silhouette sits centred on a halftone cell, so all three are
      // screened dot for dot the same wherever the grid falls
      const snap = (px: number) => (Math.floor(px / CELL_PX) + 0.5) * CELL_PX;
      const frameHeight = Math.max(frame.clientHeight, 1);
      solids.forEach((solid) => {
        if (!isDefined(BADGES[solid.node.key].bare)) return;
        const xPx = width / 2 + solid.node.column * PITCH * pxPerUnit;
        const yPx = frameHeight / 2 - lookY * pxPerUnit;
        solid.mesh.position.x = (snap(xPx) - width / 2) / pxPerUnit;
        solid.mesh.position.y = (snap(yPx) - yPx) / pxPerUnit;
      });

      // the cycle: when each team signs up and when its share lands
      let total = MONTHLY_TOTAL_USD;
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
          if (time >= slot + 2 * TRAVEL_MS) total += shareOf(team.seats);
        });
        if (now - lastClick > CLICK_EVERY_MS) {
          const channel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)];
          launch(routeFrom(channel), now, 'click');
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

      // a badge a packet reaches brightens for a moment; a silhouette keeps
      // its tone, as denser dots would close the gap under its head
      solids.forEach((solid) => {
        solid.glow *= 0.94;
        if (isDefined(BADGES[solid.node.key].bare)) return;
        const base = TONE.row + 0.12 * solid.glow;
        solid.material.uniforms.uBase.value +=
          (base - solid.material.uniforms.uBase.value) * 0.15;
      });

      // the monthly total, under Twenty
      shownTotal += (total - shownTotal) * (reducedMotion ? 1 : 0.1);
      if (isDefined(totalRef.current)) {
        anchor.set(0, -solidOf('link').node.height / 2 - 0.3, 0);
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
      hero?.removeEventListener('pointermove', forward);
      hero?.removeEventListener('pointerleave', forward);
      disposables.forEach((disposable) => disposable.dispose());
      stage.dispose();
    };
  }, []);

  return (
    <Backdrop aria-hidden ref={frameRef}>
      <SceneOverlay>
        <BelowTag ref={totalRef}>
          <TagPill>
            <TagName ref={totalValueRef}>{USD.format(0)}</TagName>
            <TagDetail>{i18n._(msg`Your 20% each month`)}</TagDetail>
          </TagPill>
        </BelowTag>
      </SceneOverlay>
    </Backdrop>
  );
}
