'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useMenuStyleWriter } from '@/platform/menu-style';
import {
  HalftoneImageBackdrop,
  type HalftoneImageBackdropProps,
} from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import {
  DURATION,
  EASING,
  HERO_COMPOSITION,
  MENU_HEIGHT_PX,
  paletteColorNumber,
  REDUCED_MOTION,
  semanticColor,
} from '@/tokens';

import { CREATOR_HERO_BACKDROP } from './creator-hero-backdrop';

// The creators hero: a creator at work, as on the page's first version. Three
// silver pieces made apart (the camera and its light, the creator before the
// screen, the microphone), each in the site's halftone in its own frame, so
// each floats on its own. The creator and the screen are one piece, since the
// creator sits before it and two halftones laid one over the other would show
// through. The scene is larger than the banner: the hero's foot cuts the
// creator at the waist.

// Each piece's halftone is laid on its own frame, so a smaller frame draws
// finer lines: its cells grow by the share of the scene it fills, and every
// piece keeps the same line spacing on screen.
const pieceSettings = (
  heightShare: number,
): HalftoneImageBackdropProps['settings'] => ({
  ...CREATOR_HERO_BACKDROP.settings,
  imageFit: 'contain',
  halftone: {
    ...CREATOR_HERO_BACKDROP.settings.halftone,
    scale: CREATOR_HERO_BACKDROP.settings.halftone.scale / heightShare,
    dashColor: paletteColorNumber('blue'),
  },
  // the pieces float; the dashes hold still
  wave: { ...CREATOR_HERO_BACKDROP.settings.wave, enabled: false },
});

// The hero's backdrop: the banner's room under the copy.
const Backdrop = styled.div`
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
`;

// The scene's frame: a wide band set on the hero's foot, centred.
const Scene = styled.div`
  animation: sceneIn ${DURATION.lg} ${EASING.gentle} ${DURATION.md} both;
  aspect-ratio: 2400 / 820;
  bottom: 0;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  width: calc(${HERO_COMPOSITION.visualBannerHeight} * 3.3);

  @keyframes sceneIn {
    from {
      opacity: 0;
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

// One piece: placed in the scene by its box (share of the scene), floating
// a few pixels up and down, slowly, each on its own beat.
const Piece = styled.div`
  animation: pieceFloat 9s ease-in-out infinite alternate;
  position: absolute;

  @keyframes pieceFloat {
    from {
      translate: 0 -0.4%;
    }
    to {
      translate: 0 0.4%;
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

type PiecePlacement = {
  imageUrl: string;
  left: string;
  top: string;
  // share of the scene's height
  heightShare: number;
  settings: HalftoneImageBackdropProps['settings'];
  aspectRatio: string;
  // where the float starts in its beat, so the pieces never move together
  delay: string;
};

// Side by side, as on the creator's desk: the camera and its light on the
// left, the creator at the screen in the middle, the microphone on the right.
const PIECES: PiecePlacement[] = [
  {
    imageUrl: '/images/partners/hero/creator-scene-camera.webp',
    left: '13.75%',
    top: '41.5%',
    heightShare: 0.51,
    settings: pieceSettings(0.51),
    aspectRatio: '838 / 1000',
    delay: '-3s',
  },
  {
    imageUrl: '/images/partners/hero/creator-scene-studio.webp',
    left: '34.6%',
    top: '4.9%',
    heightShare: 1.02,
    settings: pieceSettings(1.02),
    aspectRatio: '881 / 1000',
    delay: '0s',
  },
  {
    imageUrl: '/images/partners/hero/creator-scene-mic.webp',
    left: '65.2%',
    top: '37.8%',
    heightShare: 0.57,
    settings: pieceSettings(0.57),
    aspectRatio: '1140 / 1000',
    delay: '-6s',
  },
];

export function CreatorReferralScene() {
  const frameRef = useRef<HTMLDivElement>(null);
  const setMenuBackground = useMenuStyleWriter()?.setBackground;

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
      <Scene>
        {PIECES.map((piece) => (
          <Piece
            key={piece.imageUrl}
            style={{
              animationDelay: piece.delay,
              aspectRatio: piece.aspectRatio,
              height: `${piece.heightShare * 100}%`,
              left: piece.left,
              top: piece.top,
            }}
          >
            <HalftoneImageBackdrop
              imageUrl={piece.imageUrl}
              priority
              settings={piece.settings}
            />
          </Piece>
        ))}
      </Scene>
    </Backdrop>
  );
}
