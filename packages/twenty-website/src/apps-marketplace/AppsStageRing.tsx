'use client';

import { styled } from '@linaria/react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';

import {
  color,
  DURATION,
  EASING,
  mediaUp,
  radius,
  REDUCED_MOTION,
} from '@/tokens';

import { type MarketplaceApp } from './marketplace-app';
import { useAppsStageLogoInks } from './use-apps-stage-logo-inks';

// PROTOTYPE (?direction=e): app tiles standing on a floor tilted 48°, the
// ring turning once every 100 s. Ported from the approved Paper render
// (_draft/site-four-pages/paper-assets/logo-ring-source.html).
const SLOT_COUNT = 24;
// With the floor at 0°, this slot faces the viewer: the entrance starts here.
const FRONT_SLOT_INDEX = SLOT_COUNT / 2;
const RING_RADIUS_PX = 550;

// The stage fades the ring's sides and back into the page.
const Stage = styled.div`
  --apps-stage-ring-scale: 0.46;
  --apps-stage-ring-top: 300px;
  inset: 0;
  /* Stacked copy is taller than the ring's back: only the front shows. */
  mask-image: linear-gradient(
    to bottom,
    transparent 70%,
    ${color('black')} 80%
  );
  overflow: hidden;
  pointer-events: none;
  position: absolute;

  ${mediaUp('sm')} {
    --apps-stage-ring-scale: 0.7;
    --apps-stage-ring-top: 300px;
    mask-image: linear-gradient(
      to bottom,
      transparent 62%,
      ${color('black')} 74%
    );
  }

  ${mediaUp('md')} {
    --apps-stage-ring-scale: 1;
    --apps-stage-ring-top: 200px;
    mask-image: radial-gradient(
      ellipse 50% 110% at 50% 100%,
      ${color('black')} 58%,
      transparent 90%
    );
  }
`;

const Scaler = styled.div`
  height: 0;
  left: 50%;
  position: absolute;
  top: var(--apps-stage-ring-top);
  transform: scale(var(--apps-stage-ring-scale));
  transform-style: preserve-3d;
  width: 0;
`;

// No perspective, as in the render: the floor reads as a drawn plane.
const Floor = styled.div`
  animation: apps-stage-ring-spin 100s linear infinite;
  height: 0;
  left: 0;
  position: absolute;
  top: 0;
  transform: rotateX(48deg) rotateZ(0deg);
  transform-style: preserve-3d;
  width: 0;

  @keyframes apps-stage-ring-spin {
    to {
      transform: rotateX(48deg) rotateZ(360deg);
    }
  }

  [data-paused] & {
    animation-play-state: paused;
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const Slot = styled.div`
  left: 0;
  position: absolute;
  top: 0;
  transform: rotate(var(--apps-stage-slot-angle))
    translateY(-${RING_RADIUS_PX}px) rotate(180deg);
  transform-origin: 0 0;
`;

// The site's notch, cut into the bottom-right corner.
const Tile = styled.div`
  align-items: center;
  background-color: ${color('neutral')};
  border-radius: ${radius(3)};
  box-shadow: inset 0 0 0 1px ${color('white-10')};
  clip-path: polygon(0 0, 100% 0, 100% 82%, 82% 100%, 0 100%);
  display: flex;
  height: 104px;
  justify-content: center;
  left: -52px;
  overflow: hidden;
  position: absolute;
  top: -52px;
  width: 104px;

  /* Tiles wait for their logo to be read, then rise from the front slot
     outwards. Unread after 3 s (no JS, slow network): they show anyway. */
  animation: apps-stage-ring-tile-in ${DURATION.xl} ${EASING.standard}
    calc(120ms + var(--apps-stage-slot-distance) * 45ms) both;

  &[data-kind='plate'] {
    background-color: ${color('charcoal')};
  }

  &[data-kind='unknown'] {
    animation: apps-stage-ring-tile-late ${DURATION.xl} ${EASING.standard} 3s
      both;
    background-color: ${color('charcoal')};
  }

  @keyframes apps-stage-ring-tile-in {
    from {
      opacity: 0;
      transform: scale(0.72);
    }
  }

  @keyframes apps-stage-ring-tile-late {
    from {
      opacity: 0;
    }
  }

  ${REDUCED_MOTION} {
    animation: none;

    &[data-kind='unknown'] {
      animation: none;
    }
  }
`;

const Logo = styled.img`
  height: 56px;
  object-fit: contain;
  width: 56px;

  ${Tile}[data-kind='plate'] & {
    height: 104px;
    object-fit: cover;
    width: 104px;
  }

  ${Tile}[data-kind='unknown'] & {
    opacity: 0;
  }
`;

type SlotStyle = CSSProperties & {
  '--apps-stage-slot-angle': string;
  '--apps-stage-slot-distance': number;
};

type AppsStageRingProps = {
  apps: readonly MarketplaceApp[];
};

export function AppsStageRing({ apps }: AppsStageRingProps) {
  const inks = useAppsStageLogoInks(apps);
  const stageRef = useRef<HTMLDivElement>(null);
  const [isOffScreen, setIsOffScreen] = useState(false);

  // A ring nobody sees should not keep the compositor busy.
  useEffect(() => {
    const stage = stageRef.current;

    if (stage === null) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) =>
      setIsOffScreen(!entry.isIntersecting),
    );

    observer.observe(stage);

    return () => observer.disconnect();
  }, []);
  const appsWithLogo = apps.filter(
    (app) => app.logoUrl !== undefined && app.logoUrl.length > 0,
  );

  return (
    <Stage
      aria-hidden
      data-paused={isOffScreen ? '' : undefined}
      ref={stageRef}
    >
      <Scaler>
        <Floor>
          {appsWithLogo.length > 0 &&
            Array.from({ length: SLOT_COUNT }, (_, slotIndex) => {
              const app = appsWithLogo[slotIndex % appsWithLogo.length];
              const offset = Math.abs(slotIndex - FRONT_SLOT_INDEX);
              const style: SlotStyle = {
                '--apps-stage-slot-angle': `${(360 / SLOT_COUNT) * slotIndex}deg`,
                '--apps-stage-slot-distance': Math.min(
                  offset,
                  SLOT_COUNT - offset,
                ),
              };

              return (
                <Slot key={slotIndex} style={style}>
                  <Tile data-kind={inks[app.slug]?.kind ?? 'unknown'}>
                    <Logo alt="" decoding="async" src={app.logoUrl} />
                  </Tile>
                </Slot>
              );
            })}
        </Floor>
      </Scaler>
    </Stage>
  );
}
