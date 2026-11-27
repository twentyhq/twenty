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

// The creators hero: the channels a creator posts on, so the page reads as
// theirs at first sight, and the money they bring. YouTube, very large,
// between email and Discord, over a small mountain of coins that builds
// itself; each a 3D model in the site's halftone (as the partners services
// draw theirs).
const CHANNEL_SETTINGS = {
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
  // they float and drift a little, never enough to lose the mark
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

// The three, composed into one model (creator-channels.glb: the middle one large,
// the sides smaller and turned in), so the hero holds two canvases and
// leaves the page's budget to the sections below.
const ROW_MODEL = '/models/creator-channels.glb';

// The money it brings: a small mountain of coins (coin.glb), poured rather
// than stacked, each coin leaning and turned its own way. It builds itself
// once the hero shows: the coins fall in one after the other, from the
// bottom of the heap to its top.
const HEAP = { count: 64, radius: 2.4, height: 15 };
// a fixed scatter, so the server and the browser draw the same heap
const scatter = (seed: number): number => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};
const HEAP_PLACEMENTS = Array.from({ length: HEAP.count }, (_, index) => {
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
const HEAP_BUILD_MS = 2400;
// It starts once the coin model has had time to load, so the fall is seen.
const HEAP_START_MS = 1200;
const HEAP_COIN_SIZE = { scaleTarget: 0.9 };
// The same line spacing as the row above (its cells are larger, as the
// camera stands farther back).
const PILE_SETTINGS = {
  ...CHANNEL_SETTINGS,
  previewDistance: 9,
  halftone: { ...CHANNEL_SETTINGS.halftone, scale: 13.5 },
  animation: {
    ...CHANNEL_SETTINGS.animation,
    floatEnabled: false,
  },
} satisfies HalftoneModelProps['settings'];

const ROW_SETTINGS = {
  ...CHANNEL_SETTINGS,
  previewDistance: 1.45,
  // the camera sits closer to the wide composition: smaller cells keep the
  // same line spacing as the single models had
  halftone: { ...CHANNEL_SETTINGS.halftone, scale: 4.5 },
  // each channel floats on its own (the model holds one mesh per channel),
  // as far as a single one did: the row's model is three channels wide
  animation: {
    ...CHANNEL_SETTINGS.animation,
    floatAmplitude: 0.12,
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

// The heap's frame: under YouTube, at the hero's foot.
const Pile = styled.div`
  bottom: calc(${HERO_COMPOSITION.visualBannerHeight} * -0.16);
  height: calc(${HERO_COMPOSITION.visualBannerHeight} * 0.62);
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  width: calc(${HERO_COMPOSITION.visualBannerHeight} * 1.3);
`;

// The composition's frame: wide, raised a little from the banner's middle,
// fading in once its model has loaded.
const Channel = styled.div`
  animation: rowIn ${DURATION.lg} ${EASING.gentle} ${DURATION.md} both;
  flex-shrink: 0;
  height: 70%;
  transform: translateY(-38%);
  width: calc(${HERO_COMPOSITION.visualBannerHeight} * 2.4);

  @keyframes rowIn {
    from {
      opacity: 0;
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

export function CreatorReferralScene() {
  const frameRef = useRef<HTMLDivElement>(null);
  const setMenuBackground = useMenuStyleWriter()?.setBackground;
  // the heap's coins shown so far: it builds once the hero is on screen
  const [coinsShown, setCoinsShown] = useState(0);

  useEffect(() => {
    const total = HEAP_PLACEMENTS.length;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCoinsShown(total);
      return;
    }
    const start = performance.now() + HEAP_START_MS;
    const timer = window.setInterval(() => {
      const share = Math.min(
        Math.max((performance.now() - start) / HEAP_BUILD_MS, 0),
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
        <Channel>
          <HalftoneModel modelUrl={ROW_MODEL} settings={ROW_SETTINGS} />
        </Channel>
      </Row>
      <Pile>
        <HalftoneModel
          geometryOptions={HEAP_COIN_SIZE}
          modelUrl="/models/coin.glb"
          settings={PILE_SETTINGS}
          stack={{
            placements: HEAP_PLACEMENTS,
            tilt: 0.3,
            visible: coinsShown,
          }}
        />
      </Pile>
    </Backdrop>
  );
}
