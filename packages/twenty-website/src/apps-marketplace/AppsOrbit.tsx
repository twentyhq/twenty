'use client';

import { styled } from '@linaria/react';
import { type CSSProperties, useEffect, useMemo, useRef } from 'react';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { getReducedMotionSnapshot } from '@/platform/motion';
import {
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  REDUCED_MOTION,
  RHYTHM,
  semanticColor,
  spacing,
} from '@/tokens';

import { APPS_ORBIT_ROOM } from './apps-orbit-room';
import { type MarketplaceApp } from './marketplace-app';
import { useAppLogoInks } from './use-app-logo-inks';

// Slots repeat the apps around the whole ring; the arc shows about a third.
const SLOT_COUNT = 72;

// The radius follows the viewport so the arc runs off both edges: a banner,
// not an object in the middle. The same bounds drive the drag maths.
const ORBIT_RADIUS_MIN_PX = 520;
const ORBIT_RADIUS_VIEWPORT_RATIO = 0.62;
const ORBIT_RADIUS_MAX_PX = 1800;

const getOrbitRadiusPx = () =>
  Math.min(
    ORBIT_RADIUS_MAX_PX,
    Math.max(
      ORBIT_RADIUS_MIN_PX,
      window.innerWidth * ORBIT_RADIUS_VIEWPORT_RATIO,
    ),
  );

// The centre sits under the hero's floor, so only the upper arc shows. The
// arc's top lines up with the top of the room, above the hero's floor
// padding.
const Stage = styled.div`
  --apps-stage-orbit-radius: clamp(
    ${ORBIT_RADIUS_MIN_PX}px,
    ${ORBIT_RADIUS_VIEWPORT_RATIO * 100}vw,
    ${ORBIT_RADIUS_MAX_PX}px
  );
  --apps-stage-orbit-rise: calc(
    ${APPS_ORBIT_ROOM.base} + ${spacing(RHYTHM.hero.bottom.base)} -
      ${spacing(14)}
  );
  --apps-stage-orbit-center: calc(
    100% + var(--apps-stage-orbit-radius) - var(--apps-stage-orbit-rise)
  );

  ${mediaUp('md')} {
    --apps-stage-orbit-rise: calc(
      ${APPS_ORBIT_ROOM.md} + ${spacing(RHYTHM.hero.bottom.md)} - ${spacing(18)}
    );
  }

  inset: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
`;

const Enter = styled.div`
  animation: apps-stage-orbit-enter ${DURATION.xl} ${EASING.standard} both;
  inset: 0;
  position: absolute;

  @keyframes apps-stage-orbit-enter {
    from {
      filter: blur(8px);
      opacity: 0;
      transform: scale(0.96);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const Ring = styled.div`
  height: 0;
  left: 50%;
  position: absolute;
  top: var(--apps-stage-orbit-center);
  width: 0;
  will-change: transform;
`;

const Label = styled.span`
  align-items: center;
  color: ${semanticColor.ink};
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.medium};
  gap: 8px;
  left: 0;
  letter-spacing: 0.02em;
  opacity: calc(
    var(--apps-stage-orbit-opacity) * var(--apps-stage-orbit-fade, 1)
  );
  line-height: 1;
  position: absolute;
  text-transform: uppercase;
  top: 0;
  transform: rotate(var(--apps-stage-orbit-angle))
    translateY(calc(-1 * var(--apps-stage-orbit-radius))) rotate(90deg)
    translateY(-50%);
  transform-origin: 0 0;
  white-space: nowrap;

  ${mediaUp('md')} {
    font-size: ${fontSize(4.5)};
    gap: 12px;
  }

  &[data-glint] {
    animation: apps-stage-orbit-glint 1600ms linear;
  }

  @keyframes apps-stage-orbit-glint {
    0%,
    100% {
      color: ${semanticColor.ink};
      opacity: calc(
        var(--apps-stage-orbit-opacity) * var(--apps-stage-orbit-fade, 1)
      );
    }
    6%,
    16%,
    60% {
      color: var(--apps-stage-orbit-tint);
      opacity: var(--apps-stage-orbit-fade, 1);
    }
    11% {
      color: var(--apps-stage-orbit-tint);
      opacity: calc(0.3 * var(--apps-stage-orbit-fade, 1));
    }
  }
`;

const LabelIcon = styled.img`
  height: 20px;
  object-fit: contain;
  width: 20px;

  ${mediaUp('md')} {
    height: 28px;
    width: 28px;
  }
`;

const SLOT_OPACITIES = [1, 0.8, 0.9, 0.75, 1, 0.85, 0.8, 0.95];

const SPIN_DEGREES_PER_SECOND = -360 / 60;
const INERTIA_DECAY_PER_SECOND = 3;
const DEGREES_PER_RADIAN = 180 / Math.PI;

const GLINT_MIN_INTERVAL_SECONDS = 0.6;
const GLINT_EXTRA_INTERVAL_SECONDS = 0.8;
const GLINT_ARC_DEGREES = 40;

// Labels stay whole near the top of the arc and fade out as they turn
// down the sides, so the ring dissolves instead of running off the edges.
const FADE_START_DEGREES = 14;
const FADE_END_DEGREES = 34;

const getAngleFromTop = (angle: number) =>
  ((((angle + 180) % 360) + 360) % 360) - 180;

type StageStyle = CSSProperties & {
  '--apps-stage-orbit-angle': string;
  '--apps-stage-orbit-opacity': number;
  '--apps-stage-orbit-tint': string;
};

type AppsOrbitProps = {
  apps: readonly MarketplaceApp[];
};

export function AppsOrbit({ apps }: AppsOrbitProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  // A new array would make the ink reader read again.
  const appsWithLogo = useMemo(
    () => apps.filter((app) => isNonEmptyString(app.logoUrl)),
    [apps],
  );
  const inks = useAppLogoInks(appsWithLogo);

  useEffect(() => {
    const stage = stageRef.current;
    const ring = ringRef.current;
    const surface = stage?.closest('section');

    if (!isDefined(stage) || !isDefined(ring) || !isDefined(surface)) {
      return;
    }

    surface.style.cursor = 'grab';
    surface.style.touchAction = 'pan-y';

    const isReducedMotion = getReducedMotionSnapshot();
    let spin = 0;
    let isDragging = false;
    let dragX = 0;
    let dragTime = 0;
    let throwVelocity = 0;
    let isVisible = true;
    let frame = 0;
    let last = performance.now();
    let nextGlint = GLINT_MIN_INTERVAL_SECONDS;

    const glint = () => {
      const labels = [...ring.children].filter((label) => {
        if (!(label instanceof HTMLElement)) {
          return false;
        }
        const angle =
          Number.parseFloat(
            label.style.getPropertyValue('--apps-stage-orbit-angle'),
          ) + spin;
        const fromTop = getAngleFromTop(angle);

        return (
          Math.abs(fromTop) < GLINT_ARC_DEGREES &&
          !label.hasAttribute('data-glint')
        );
      });
      const label = labels[Math.floor(Math.random() * labels.length)];

      if (!isDefined(label)) {
        return;
      }

      label.setAttribute('data-glint', '');
      label.addEventListener(
        'animationend',
        () => label.removeAttribute('data-glint'),
        { once: true },
      );
    };

    const draw = () => {
      ring.style.transform = `rotate(${spin}deg)`;

      for (const label of ring.children) {
        if (!(label instanceof HTMLElement)) {
          continue;
        }
        const fromTop = Math.abs(
          getAngleFromTop(
            Number.parseFloat(
              label.style.getPropertyValue('--apps-stage-orbit-angle'),
            ) + spin,
          ),
        );
        const fade = Math.min(
          1,
          Math.max(
            0,
            (FADE_END_DEGREES - fromTop) /
              (FADE_END_DEGREES - FADE_START_DEGREES),
          ),
        );
        label.style.setProperty('--apps-stage-orbit-fade', fade.toFixed(3));
      }
    };

    const degreesPerPixel = () => DEGREES_PER_RADIAN / getOrbitRadiusPx();

    const tick = (now: number) => {
      const elapsed = Math.min(0.1, (now - last) / 1000);
      last = now;

      if (!isDragging) {
        spin +=
          ((isReducedMotion ? 0 : SPIN_DEGREES_PER_SECOND) + throwVelocity) *
          elapsed;
        throwVelocity *= Math.exp(-INERTIA_DECAY_PER_SECOND * elapsed);
      }

      nextGlint -= elapsed;

      if (nextGlint <= 0 && !isReducedMotion) {
        glint();
        nextGlint =
          GLINT_MIN_INTERVAL_SECONDS +
          Math.random() * GLINT_EXTRA_INTERVAL_SECONDS;
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
          isDefined(event.target.closest('[data-apps-stage-copy]')))
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
      const turn = deltaX * degreesPerPixel();

      dragX = event.clientX;
      dragTime = event.timeStamp;
      spin += turn;
      throwVelocity = isReducedMotion
        ? 0
        : turn / deltaTime - SPIN_DEGREES_PER_SECOND;
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

  if (appsWithLogo.length === 0) {
    return null;
  }

  return (
    <Stage aria-hidden ref={stageRef}>
      <Enter>
        <Ring ref={ringRef}>
          {Array.from({ length: SLOT_COUNT }, (_, slot) => {
            const app = appsWithLogo[slot % appsWithLogo.length];
            const tint = inks[app.slug]?.tint ?? '';
            const style: StageStyle = {
              '--apps-stage-orbit-angle': `${(360 / SLOT_COUNT) * slot}deg`,
              '--apps-stage-orbit-opacity':
                SLOT_OPACITIES[slot % SLOT_OPACITIES.length],
              '--apps-stage-orbit-tint':
                tint.length > 0 ? tint : 'currentColor',
            };

            return (
              <Label key={`${slot}-${app.slug}`} style={style}>
                <LabelIcon alt="" src={app.logoUrl} />
                {app.name}
              </Label>
            );
          })}
        </Ring>
      </Enter>
    </Stage>
  );
}
