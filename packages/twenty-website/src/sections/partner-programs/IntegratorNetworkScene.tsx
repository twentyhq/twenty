'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useMenuStyleWriter } from '@/platform/menu-style';
import {
  HalftoneModel,
  type HalftoneModelProps,
} from '@/platform/visuals/rigs/HalftoneModel';
import {
  DURATION,
  EASING,
  HERO_COMPOSITION,
  MENU_HEIGHT_PX,
  paletteColorNumber,
  REDUCED_MOTION,
  semanticColor,
} from '@/tokens';
import { cssVariableStyle } from '@/ui/css-variable-style';

// The integrators hero: an integrator's tools, so the page reads as theirs at
// first sight, and the money they bring. A terminal, very large, between
// code braces and a keyboard key, over a small mountain of coins that
// builds itself;
// each a 3D model in the site's halftone (as the partners services draw
// theirs).
const TOOL_SETTINGS = {
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
    scale: 14,
    power: 0.4,
    width: 0.5,
    dashColor: paletteColorNumber('blue'),
    hoverDashColor: paletteColorNumber('blue'),
  },
  // they float and drift a little, never enough to lose the shape
  animation: {
    autoRotateEnabled: false,
    floatEnabled: true,
    floatSpeed: 0.8,
    floatAmplitude: 0.05,
    driftAmount: 10,
    followDragEnabled: false,
    springReturnEnabled: true,
    springDamping: 0.6,
    springStrength: 0.06,
  },
} satisfies HalftoneModelProps['settings'];

// The row, left to right: code braces, the terminal, a keyboard key (the
// site's own code keycap). Each model's share of the banner's height, the way
// it turns (the sides face in towards the terminal), how far it sits up from
// the banner's middle, and how far it tucks in on its neighbours, in banner
// heights.
const ITEMS = [
  {
    model: 'braces',
    size: 0.46,
    turn: 0.32,
    lean: 0,
    lift: 0.32,
    tuck: -0.02,
    geometry: undefined,
  },
  {
    model: 'terminal',
    size: 0.8,
    turn: 0,
    lean: 0,
    lift: 0.36,
    tuck: 0,
    geometry: undefined,
  },
  {
    model: 'code-keycap',
    size: 0.56,
    turn: -0.32,
    // seen from above, so its top and the </> on it show
    lean: 0.65,
    lift: 0.32,
    tuck: -0.02,
    geometry: undefined,
  },
] as const;

// The money it brings: a small mountain of coins (coin.glb, as on the
// creators hero), poured rather than stacked, each coin leaning and turned
// its own way. It builds itself once the hero shows: the coins fall in one
// after the other, from the bottom of the heap to its top.
const HEAP = { count: 64, radius: 2.4, height: 15 };
// a fixed scatter, so the server and the browser draw the same heap
const scatter = (seed: number): number => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};
const BASE_PLACEMENTS = Array.from({ length: HEAP.count }, (_, index) => {
  // more coins near the base, as a heap has
  const level = 1 - Math.sqrt(scatter(index * 5 + 1));
  const reach = HEAP.radius * (1 - level) * Math.sqrt(scatter(index * 5 + 2));
  const angle = scatter(index * 5 + 3) * Math.PI * 2;
  // the slope tips them: some lie flatter, some steeper
  const lean = 0.3 + 0.7 * scatter(index * 5 + 4);
  return {
    x: Math.cos(angle) * reach,
    y: level * HEAP.height,
    z: Math.sin(angle) * reach * 0.55,
    tiltX: (scatter(index * 7 + 5) - 0.5) * 1.2 * lean,
    tiltZ: (scatter(index * 11 + 6) - 0.5) * 1.2 * lean,
    turn: scatter(index * 13 + 7) * Math.PI * 2,
  };
}).toSorted((a, b) => a.y - b.y);
// How long the heap takes to build, from the first coin to the last.
const BASE_BUILD_MS = 2400;
// It starts once the coin model has had time to load, so the fall is seen.
const BASE_START_MS = 1200;
const BASE_COIN_SIZE = { scaleTarget: 0.9 };
const BASE_SETTINGS = {
  ...TOOL_SETTINGS,
  previewDistance: 9,
  halftone: { ...TOOL_SETTINGS.halftone, scale: 9 },
  animation: {
    ...TOOL_SETTINGS.animation,
    floatEnabled: false,
  },
} satisfies HalftoneModelProps['settings'];

// The hero's backdrop: the banner's room under the copy.
const Backdrop = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
`;

const Row = styled.div`
  align-items: center;
  bottom: 0;
  display: flex;
  height: ${HERO_COMPOSITION.visualBannerHeight};
  justify-content: center;
  left: 0;
  position: absolute;
  right: 0;
`;

// The heap's frame: under the terminal, at the hero's foot.
const Base = styled.div`
  bottom: calc(${HERO_COMPOSITION.visualBannerHeight} * -0.16);
  height: calc(${HERO_COMPOSITION.visualBannerHeight} * 0.62);
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  width: calc(${HERO_COMPOSITION.visualBannerHeight} * 1.3);
`;

// A model's square frame, sized against the banner (--size), moved up from
// its middle (--lift) and tucked in on its neighbours (--tuck).
const Tool = styled.div`
  /* each tool fades in on its own beat, so the models loading at different
     moments never pop in */
  animation: integratorToolIn ${DURATION.lg} ${EASING.gentle} both;
  animation-delay: calc(var(--order) * ${DURATION.xs} + ${DURATION.md});
  aspect-ratio: 1;
  flex-shrink: 0;
  height: calc(var(--size) * 100%);
  margin-inline: calc(var(--tuck) * ${HERO_COMPOSITION.visualBannerHeight});
  transform: translateY(calc(var(--lift) * -100%));

  @keyframes integratorToolIn {
    from {
      opacity: 0;
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

export function IntegratorNetworkScene() {
  const frameRef = useRef<HTMLDivElement>(null);
  const setMenuBackground = useMenuStyleWriter()?.setBackground;
  // the heap's coins shown so far: it builds once the hero is on screen
  const [coinsShown, setCoinsShown] = useState(0);

  useEffect(() => {
    const total = BASE_PLACEMENTS.length;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCoinsShown(total);
      return;
    }
    const start = performance.now() + BASE_START_MS;
    const timer = window.setInterval(() => {
      const share = Math.min(
        Math.max((performance.now() - start) / BASE_BUILD_MS, 0),
        1,
      );
      setCoinsShown(Math.round(total * share));
      if (share >= 1) window.clearInterval(timer);
    }, 80);
    return () => window.clearInterval(timer);
  }, []);

  // The hero runs up under the menu: the menu lets it show at the top of
  // the page and takes the hero's own surface over the first scroll. The
  // menu's background is set from the page root, where the surface token is
  // the default one, so the hero's colour is read from the hero itself.
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

  return (
    <Backdrop aria-hidden ref={frameRef}>
      <Row>
        {ITEMS.map((item, index) => (
          <Tool
            key={item.model}
            style={cssVariableStyle({
              '--lift': item.lift,
              '--order': index,
              '--size': item.size,
              '--tuck': item.tuck,
            })}
          >
            <HalftoneModel
              geometryOptions={item.geometry}
              initialPose={{ rotationX: item.lean, rotationY: item.turn }}
              modelUrl={`/models/${item.model}.glb`}
              settings={TOOL_SETTINGS}
            />
          </Tool>
        ))}
      </Row>
      <Base>
        <HalftoneModel
          geometryOptions={BASE_COIN_SIZE}
          modelUrl="/models/coin.glb"
          settings={BASE_SETTINGS}
          stack={{
            placements: BASE_PLACEMENTS,
            tilt: 0.3,
            visible: coinsShown,
          }}
        />
      </Base>
    </Backdrop>
  );
}
