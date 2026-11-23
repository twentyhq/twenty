'use client';

import { styled } from '@linaria/react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { type CSSProperties, useEffect, useMemo, useRef } from 'react';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { getReducedMotionSnapshot } from '@/platform/motion';
import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import {
  color,
  DURATION,
  EASING,
  mediaUp,
  REDUCED_MOTION,
  semanticColor,
} from '@/tokens';
import { MODEL_CARD_SETTINGS } from '@/ui/model-card-settings';

import { AppIcon } from './AppIcon';
import { type MarketplaceApp } from './marketplace-app';
import { useAppLogoInks } from './use-app-logo-inks';

// Drawn on a fixed 1000x462 canvas, scaled to the stage.
const CANVAS_WIDTH_PX = 1000;
const CANVAS_HEIGHT_PX = 462;
const TILE_SIZE_PX = 64;
const HUB_SIZE_PX = 180;
const HUB_PORT_X_PX = 70;
const CORNER_RADIUS_PX = 14;

// Two columns on each side of the keycap, mirrored.
const SIDE_SLOTS = [
  { x: 210, y: -150 },
  { x: 380, y: -60 },
  { x: 380, y: 90 },
  { x: 210, y: 160 },
];
const SLOTS = [
  ...SIDE_SLOTS.map((slot) => ({ x: -slot.x, y: slot.y })),
  ...SIDE_SLOTS,
];

const GLINT_MIN_INTERVAL_MS = 900;
const GLINT_EXTRA_INTERVAL_MS = 900;

type Point = { x: number; y: number };

// An orthogonal path through the points, its corners rounded.
const roundedPath = (points: readonly Point[]) =>
  points
    .map((point, index) => {
      const previous = points[index - 1];
      const next = points[index + 1];

      if (!isDefined(previous)) {
        return `M ${point.x} ${point.y}`;
      }
      if (!isDefined(next)) {
        return `L ${point.x} ${point.y}`;
      }

      const radius = Math.min(
        CORNER_RADIUS_PX,
        Math.hypot(point.x - previous.x, point.y - previous.y) / 2,
        Math.hypot(next.x - point.x, next.y - point.y) / 2,
      );
      const towards = (target: Point) => {
        const length = Math.hypot(target.x - point.x, target.y - point.y);

        return {
          x: point.x + ((target.x - point.x) / length) * radius,
          y: point.y + ((target.y - point.y) / length) * radius,
        };
      };
      const start = towards(previous);
      const end = towards(next);

      return `L ${start.x} ${start.y} Q ${point.x} ${point.y} ${end.x} ${end.y}`;
    })
    .join(' ');

// HomeHero's app-window height at every width, shared by every hero visual;
// only the hub's scale follows the viewport.
const Stage = styled.div`
  --apps-hub-scale: 0.39;
  height: ${APP_PREVIEW_STAGE.windowScene.heightPx}px;
  position: relative;
  width: 100%;

  ${mediaUp('sm')} {
    --apps-hub-scale: 0.7;
  }

  ${mediaUp('md')} {
    --apps-hub-scale: 1.2;
  }
`;

const Canvas = styled.div`
  height: ${CANVAS_HEIGHT_PX}px;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%) scale(var(--apps-hub-scale));
  width: ${CANVAS_WIDTH_PX}px;
`;

const Links = styled.svg`
  inset: 0;
  overflow: visible;
  position: absolute;

  & path {
    fill: none;
    stroke: ${semanticColor.lineStrong};
    stroke-dasharray: 2 5;
    stroke-linecap: round;
    stroke-width: 1.5;
    transition: stroke ${DURATION.md} ${EASING.standard};
  }

  & path[data-glint] {
    animation: apps-hub-flow 1600ms linear;
    stroke: var(--apps-hub-tint);
    stroke-dasharray: 6 6;
    stroke-width: 2;
  }

  @keyframes apps-hub-flow {
    to {
      stroke-dashoffset: -48;
    }
  }

  ${REDUCED_MOTION} {
    & path[data-glint] {
      animation: none;
    }
  }
`;

const Placed = styled.div`
  left: calc(50% + var(--apps-hub-x));
  position: absolute;
  top: calc(50% + var(--apps-hub-y));
  transform: translate(-50%, -50%);
`;

// A block: the tile, with its thickness drawn as a hard shadow beneath.
const Block = styled.div`
  animation: apps-hub-in ${DURATION.xl} ${EASING.standard}
    calc(200ms + var(--apps-hub-index) * 70ms) both;
  filter: drop-shadow(0 5px 0 ${semanticColor.lineStrong});
  transition: filter ${DURATION.md} ${EASING.standard};

  &[data-glint] {
    filter: drop-shadow(0 5px 0 var(--apps-hub-tint))
      drop-shadow(0 0 16px var(--apps-hub-tint));
  }

  @keyframes apps-hub-in {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
    transition: none;
  }
`;

const Hub = styled.div`
  height: ${HUB_SIZE_PX}px;
  width: ${HUB_SIZE_PX}px;
`;

type NodeStyle = CSSProperties & {
  '--apps-hub-index'?: number;
  '--apps-hub-tint'?: string;
  '--apps-hub-x': string;
  '--apps-hub-y': string;
};

type AppsHubProps = {
  apps: readonly MarketplaceApp[];
};

export function AppsHub({ apps }: AppsHubProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  // A new array would make the ink reader read again.
  const shown = useMemo(
    () =>
      apps
        .filter((app) => isNonEmptyString(app.logoUrl))
        .slice(0, SLOTS.length),
    [apps],
  );
  const inks = useAppLogoInks(shown);
  const centre = { x: CANVAS_WIDTH_PX / 2, y: CANVAS_HEIGHT_PX / 2 };
  const nodes = shown.map((app, index) => {
    const slot = SLOTS[index];
    const side = Math.sign(slot.x);
    const port = {
      x: centre.x + side * HUB_PORT_X_PX,
      y: centre.y + slot.y * 0.25,
    };
    const tile = { x: centre.x + slot.x, y: centre.y + slot.y };
    const tileEdge = { x: tile.x - side * (TILE_SIZE_PX / 2), y: tile.y };
    const bend = port.x + (tileEdge.x - port.x) / 2;
    const tint = inks[app.slug]?.tint ?? '';

    return {
      app,
      slot,
      tint: tint.length > 0 ? tint : color('blue'),
      path: roundedPath([
        port,
        { x: bend, y: port.y },
        { x: bend, y: tileEdge.y },
        tileEdge,
      ]),
    };
  });

  useEffect(() => {
    const stage = stageRef.current;

    if (!isDefined(stage) || getReducedMotionSnapshot()) {
      return;
    }

    let timer = 0;
    let lit: Element[] = [];

    const glint = () => {
      lit.forEach((element) => element.removeAttribute('data-glint'));
      const index = Math.floor(Math.random() * SLOTS.length);

      lit = [...stage.querySelectorAll(`[data-apps-hub-node="${index}"]`)];
      lit.forEach((element) => element.setAttribute('data-glint', ''));
      timer = window.setTimeout(
        glint,
        GLINT_MIN_INTERVAL_MS + Math.random() * GLINT_EXTRA_INTERVAL_MS,
      );
    };

    timer = window.setTimeout(glint, GLINT_MIN_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Stage aria-hidden data-illustration="apps-hub" ref={stageRef}>
      <Canvas>
        <Links viewBox={`0 0 ${CANVAS_WIDTH_PX} ${CANVAS_HEIGHT_PX}`}>
          {nodes.map((node, index) => (
            <path
              d={node.path}
              data-apps-hub-node={index}
              key={node.app.slug}
              style={{ '--apps-hub-tint': node.tint } as CSSProperties}
            />
          ))}
        </Links>
        <Placed
          style={{ '--apps-hub-x': '0px', '--apps-hub-y': '0px' } as NodeStyle}
        >
          <Hub>
            <HalftoneModel
              modelUrl="/models/code-keycap.glb"
              settings={MODEL_CARD_SETTINGS}
            />
          </Hub>
        </Placed>
        {nodes.map((node, index) => {
          const style: NodeStyle = {
            '--apps-hub-index': index,
            '--apps-hub-tint': node.tint,
            '--apps-hub-x': `${node.slot.x}px`,
            '--apps-hub-y': `${node.slot.y}px`,
          };

          return (
            <Placed key={node.app.slug} style={style}>
              <Block data-apps-hub-node={index}>
                <AppIcon app={node.app} sizePx={TILE_SIZE_PX} />
              </Block>
            </Placed>
          );
        })}
      </Canvas>
    </Stage>
  );
}
