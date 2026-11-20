'use client';

import { styled } from '@linaria/react';
import { type CSSProperties, useEffect, useRef } from 'react';

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
// 30 slots of 80px, as on Profound's integrations hero: denser and finer
// than 24 of 104px.
const SLOT_COUNT = 30;
// With the floor at 0°, this slot faces the viewer: the entrance starts here.
const FRONT_SLOT_INDEX = SLOT_COUNT / 2;
const RING_RADIUS_PX = 550;
// One turn every 100 s; a throw decays like the partners globe's.
const SPIN_DEGREES_PER_SECOND = 360 / 100;
const INERTIA_DECAY_PER_SECOND = 3;
const DEGREES_PER_RADIAN = 180 / Math.PI;

// The stage fades the ring's sides and back into the page.
const Stage = styled.div`
  --apps-stage-ring-scale: 0.6;
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
    --apps-stage-ring-scale: 0.8;
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
    /* One soft fade from the bottom centre: the sides die out gradually. */
    mask-image: radial-gradient(
      ellipse at 50% 100%,
      ${color('black')} 0%,
      transparent 70%
    );
  }
`;

// The whole ring arrives from a blur, a little low and tipped back (0.6 s),
// as on Profound; the tiles then cascade in on top.
const Enter = styled.div`
  animation: apps-stage-ring-enter ${DURATION.xl} ${EASING.standard} backwards;
  inset: 0;
  position: absolute;

  @keyframes apps-stage-ring-enter {
    from {
      filter: blur(8px);
      opacity: 0;
      transform: translateY(24px) rotateX(26deg);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
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
// No perspective, as in the render: the floor reads as a drawn plane. Its
// turn is driven from script so the ring can be grabbed and thrown.
const Floor = styled.div`
  height: 0;
  left: 0;
  position: absolute;
  top: 0;
  transform: rotateX(48deg) rotateZ(0deg);
  transform-style: preserve-3d;
  width: 0;
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
  border-radius: ${radius(5)};
  box-shadow: inset 0 0 0 1px ${color('white-10')};
  clip-path: polygon(0 0, 100% 0, 100% 82%, 82% 100%, 0 100%);
  display: flex;
  height: 80px;
  justify-content: center;
  left: -40px;
  overflow: hidden;
  position: absolute;
  top: -40px;
  width: 80px;

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
  height: 44px;
  object-fit: contain;
  width: 44px;

  ${Tile}[data-kind='plate'] & {
    height: 80px;
    object-fit: cover;
    width: 80px;
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
  const floorRef = useRef<HTMLDivElement>(null);

  // The ring turns slowly on its own, and can be grabbed, turned and thrown
  // like the partners globe: the hand overrides the spin, a throw decays,
  // then the slow spin takes over again. Still when nobody can see it.
  useEffect(() => {
    const stage = stageRef.current;
    const floor = floorRef.current;
    // The ring sits in the hero's background layer, under the content layer,
    // so the whole hero listens; the copy itself stays selectable.
    const surface = stage?.closest('section');

    if (
      stage === null ||
      floor === null ||
      surface === null ||
      surface === undefined
    ) {
      return;
    }

    surface.style.cursor = 'grab';
    // Horizontal drags turn the ring; vertical ones still scroll the page.
    surface.style.touchAction = 'pan-y';

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let spin = 0;
    let isDragging = false;
    let dragX = 0;
    let dragTime = 0;
    let throwVelocity = 0;
    let isVisible = true;
    let frame = 0;
    let last = performance.now();

    const draw = () => {
      floor.style.transform = `rotateX(48deg) rotateZ(${spin}deg)`;
    };

    // A pointer moving along the front of the ring turns it by its arc.
    const degreesPerPixel = () => {
      const scale = Number.parseFloat(
        getComputedStyle(stage).getPropertyValue('--apps-stage-ring-scale'),
      );

      return DEGREES_PER_RADIAN / (RING_RADIUS_PX * (scale || 1));
    };

    const tick = (now: number) => {
      const elapsed = Math.min(0.1, (now - last) / 1000);
      last = now;

      if (isDragging) {
        // The pointer moves the ring; nothing else does.
      } else if (Math.abs(throwVelocity) > SPIN_DEGREES_PER_SECOND) {
        spin += throwVelocity * elapsed;
        throwVelocity *= Math.exp(-INERTIA_DECAY_PER_SECOND * elapsed);
      } else if (!reducedMotion) {
        throwVelocity = 0;
        spin += SPIN_DEGREES_PER_SECOND * elapsed;
      }

      draw();
      frame = isVisible ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (frame === 0) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.button !== 0 ||
        (event.target instanceof Element &&
          event.target.closest('[data-apps-stage-copy]') !== null)
      ) {
        return;
      }

      isDragging = true;
      dragX = event.clientX;
      dragTime = event.timeStamp;
      throwVelocity = 0;
      surface.setPointerCapture(event.pointerId);
      surface.style.cursor = 'grabbing';
      surface.style.userSelect = 'none';
      start();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) {
        return;
      }

      const deltaX = event.clientX - dragX;
      const deltaTime = Math.max(1, event.timeStamp - dragTime) / 1000;
      // The front tiles follow the pointer: dragging right turns them right.
      const turn = -deltaX * degreesPerPixel();

      dragX = event.clientX;
      dragTime = event.timeStamp;
      spin += turn;
      throwVelocity = reducedMotion ? 0 : turn / deltaTime;
      draw();
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      surface.style.cursor = 'grab';
      surface.style.userSelect = '';

      if (surface.hasPointerCapture(event.pointerId)) {
        surface.releasePointerCapture(event.pointerId);
      }
    };

    surface.addEventListener('pointerdown', handlePointerDown);
    surface.addEventListener('pointermove', handlePointerMove);
    surface.addEventListener('pointerup', handlePointerUp);
    surface.addEventListener('pointercancel', handlePointerUp);

    // A ring nobody sees should not keep a frame loop busy.
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;

      if (isVisible) {
        start();
      }
    });

    observer.observe(stage);
    draw();
    start();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      surface.style.cursor = '';
      surface.style.touchAction = '';
      surface.removeEventListener('pointerdown', handlePointerDown);
      surface.removeEventListener('pointermove', handlePointerMove);
      surface.removeEventListener('pointerup', handlePointerUp);
      surface.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  const appsWithLogo = apps.filter(
    (app) => app.logoUrl !== undefined && app.logoUrl.length > 0,
  );

  return (
    <Stage aria-hidden ref={stageRef}>
      <Enter>
        <Scaler>
          <Floor ref={floorRef}>
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
      </Enter>
    </Stage>
  );
}
