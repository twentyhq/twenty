'use client';

import { styled } from '@linaria/react';
import { type CSSProperties, useEffect, useMemo, useRef } from 'react';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { getReducedMotionSnapshot } from '@/platform/motion';
import {
  BREAKPOINT_PX,
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  REDUCED_MOTION,
  semanticColor,
} from '@/tokens';

import { type MarketplaceApp } from './marketplace-app';
import { useAppsStageLogoInks } from './use-apps-stage-logo-inks';

const SLOT_COUNT = 44;
const ORBIT_RADIUS_PX = 560;
const ORBIT_RADIUS_SMALL_PX = 300;

// The centre sits under the hero's floor, so only the upper arc shows.
const Stage = styled.div`
  --apps-stage-orbit-center: calc(100% + 160px);
  --apps-stage-orbit-radius: ${ORBIT_RADIUS_SMALL_PX}px;
  inset: 0;
  mask-image: radial-gradient(
    ellipse at 50% 100%,
    ${color('black')} 30%,
    transparent 75%
  );
  overflow: hidden;
  pointer-events: none;
  position: absolute;

  ${mediaUp('md')} {
    --apps-stage-orbit-center: calc(100% + 250px);
    --apps-stage-orbit-radius: ${ORBIT_RADIUS_PX}px;
  }
`;

// Outside the orbit's stage, whose mask keeps only its bottom.
const DASHES = `repeating-linear-gradient(
  to right,
  ${color('black')} 0 14px,
  transparent 14px 17px
)`;

const ROWS = (ink: string) => `repeating-linear-gradient(
  to bottom,
  ${ink} 0 1px,
  transparent 1px 5px
)`;

const Texture = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;

  &::before {
    content: '';
    inset: 0;
    mask-composite: intersect;
    position: absolute;
    background-image: ${ROWS(color('iron'))};
    mask-image:
      ${DASHES},
      radial-gradient(
        ellipse 70% 80% at 50% 0%,
        ${color('black')} 0%,
        transparent 100%
      );
    opacity: 0.35;
  }

  /* Its own element, so moving the blue blobs never repaints the grey rows. */
  & > div {
    background-image: ${ROWS(color('blue'))};
    mask-composite: intersect, add, add;
    mask-image:
      ${DASHES},
      radial-gradient(
        ellipse 220px 130px at var(--apps-stage-orbit-blob-1, -999px -999px),
        ${color('black')} 0%,
        transparent 100%
      ),
      radial-gradient(
        ellipse 150px 190px at var(--apps-stage-orbit-blob-2, -999px -999px),
        ${color('black')} 0%,
        transparent 100%
      ),
      radial-gradient(
        ellipse 260px 110px at var(--apps-stage-orbit-blob-3, -999px -999px),
        ${color('black')} 0%,
        transparent 100%
      );
    inset: 0;
    opacity: 0;
    position: absolute;
    transition: opacity ${DURATION.lg} ${EASING.standard};
  }

  &[data-lit] > div {
    opacity: 0.9;
  }

  ${REDUCED_MOTION} {
    & > div {
      transition: none;
    }
  }
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
  will-change: transform;
  left: 50%;
  position: absolute;
  top: var(--apps-stage-orbit-center);
  width: 0;
`;

const Label = styled.span`
  align-items: center;
  color: ${semanticColor.inkMuted};
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  gap: 6px;
  left: 0;
  letter-spacing: 0.02em;
  opacity: var(--apps-stage-orbit-opacity);
  line-height: 1;
  position: absolute;
  text-transform: uppercase;
  top: 0;
  transform: rotate(var(--apps-stage-orbit-angle))
    translateY(calc(-1 * var(--apps-stage-orbit-radius))) rotate(90deg)
    translateY(-50%);
  transform-origin: 0 0;
  white-space: nowrap;

  &[data-glint] {
    animation: apps-stage-orbit-glint 1600ms linear;
  }

  @keyframes apps-stage-orbit-glint {
    0%,
    100% {
      color: ${semanticColor.inkMuted};
      opacity: var(--apps-stage-orbit-opacity);
    }
    6%,
    16%,
    60% {
      color: var(--apps-stage-orbit-tint);
      opacity: 1;
    }
    11% {
      color: var(--apps-stage-orbit-tint);
      opacity: 0.3;
    }
  }
`;

const LabelIcon = styled.img`
  filter: grayscale(1);
  height: 14px;
  object-fit: contain;
  width: 14px;

  [data-glint] > & {
    animation: apps-stage-orbit-glint-icon 1600ms linear;
  }

  @keyframes apps-stage-orbit-glint-icon {
    6%,
    60% {
      filter: none;
    }
  }
`;

const SLOT_OPACITIES = [0.75, 0.45, 0.6, 0.35, 0.7, 0.5, 0.4, 0.65];

const SPIN_DEGREES_PER_SECOND = -360 / 40;
const INERTIA_DECAY_PER_SECOND = 3;
const DEGREES_PER_RADIAN = 180 / Math.PI;

const GLINT_MIN_INTERVAL_SECONDS = 0.6;
const GLINT_EXTRA_INTERVAL_SECONDS = 0.8;
const GLINT_ARC_DEGREES = 70;
const BLOB_FOLLOW = [0.2, 0.1, 0.05];

type StageStyle = CSSProperties & {
  '--apps-stage-orbit-angle': string;
  '--apps-stage-orbit-opacity': number;
  '--apps-stage-orbit-tint': string;
};

type AppsStageOrbitProps = {
  apps: readonly MarketplaceApp[];
};

export function AppsStageOrbit({ apps }: AppsStageOrbitProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const textureRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  // A new array would make the ink reader read again.
  const appsWithLogo = useMemo(
    () => apps.filter((app) => isNonEmptyString(app.logoUrl)),
    [apps],
  );
  const inks = useAppsStageLogoInks(appsWithLogo);

  useEffect(() => {
    const stage = stageRef.current;
    const ring = ringRef.current;
    const texture = textureRef.current;
    const glow = glowRef.current;
    const surface = stage?.closest('section');

    if (
      !isDefined(stage) ||
      !isDefined(ring) ||
      !isDefined(texture) ||
      !isDefined(glow) ||
      !isDefined(surface)
    ) {
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
    const pointer = { x: 0, y: 0 };
    const blobs = BLOB_FOLLOW.map((follow) => ({ follow, x: 0, y: 0 }));

    const glint = () => {
      const labels = [...ring.children].filter((label) => {
        if (!(label instanceof HTMLElement)) {
          return false;
        }
        const angle =
          Number.parseFloat(
            label.style.getPropertyValue('--apps-stage-orbit-angle'),
          ) + spin;
        const fromTop = ((((angle + 180) % 360) + 360) % 360) - 180;

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
    };

    const degreesPerPixel = () =>
      DEGREES_PER_RADIAN /
      (window.matchMedia(`(min-width: ${BREAKPOINT_PX.md}px)`).matches
        ? ORBIT_RADIUS_PX
        : ORBIT_RADIUS_SMALL_PX);

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

      if (texture.hasAttribute('data-lit')) {
        blobs.forEach((blob, index) => {
          const stepX = (pointer.x - blob.x) * blob.follow;
          const stepY = (pointer.y - blob.y) * blob.follow;

          // Settled: leave the mask alone, a repaint would cost a frame.
          if (Math.abs(stepX) < 0.3 && Math.abs(stepY) < 0.3) {
            return;
          }

          blob.x += stepX;
          blob.y += stepY;
          glow.style.setProperty(
            `--apps-stage-orbit-blob-${index + 1}`,
            `${blob.x.toFixed(1)}px ${blob.y.toFixed(1)}px`,
          );
        });
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
      const box = texture.getBoundingClientRect();

      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;

      if (!texture.hasAttribute('data-lit')) {
        blobs.forEach((blob) => {
          blob.x = pointer.x;
          blob.y = pointer.y;
        });
        texture.setAttribute('data-lit', '');
      }

      start();

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

    const handlePointerLeave = () => texture.removeAttribute('data-lit');

    surface.addEventListener('pointerleave', handlePointerLeave);
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
      surface.removeEventListener('pointerleave', handlePointerLeave);
      surface.removeEventListener('pointerup', handlePointerUp);
      surface.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  if (appsWithLogo.length === 0) {
    return null;
  }

  return (
    <>
      <Texture aria-hidden ref={textureRef}>
        <div ref={glowRef} />
      </Texture>
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
    </>
  );
}
