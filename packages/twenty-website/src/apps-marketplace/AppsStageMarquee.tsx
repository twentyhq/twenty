'use client';

import { styled } from '@linaria/react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';

import { type MarketplaceApp } from './marketplace-app';

// PROTOTYPE (?direction=e&hero=marquee): the ring's alternative, after
// Dovetail's customer band: two quiet rows of the apps as grey wordmarks
// (icon + name), drifting opposite ways, fading out at both edges.
const Stage = styled.div`
  bottom: ${spacing(14)};
  left: 0;
  mask-image: linear-gradient(
    to right,
    transparent,
    ${color('black')} 20%,
    ${color('black')} 80%,
    transparent
  );
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  right: 0;

  & > * + * {
    margin-top: ${spacing(8)};
  }

  ${mediaUp('md')} {
    bottom: ${spacing(20)};
  }
`;

const Row = styled.div`
  animation: apps-stage-marquee-left 60s linear infinite;
  display: flex;
  width: max-content;

  /* The second row starts half a slot along and drifts the other way. */
  &[data-direction='right'] {
    animation-duration: 75s;
    animation-name: apps-stage-marquee-right;
    margin-left: calc(var(--apps-stage-marquee-slot) / -2);
  }

  [data-paused] & {
    animation-play-state: paused;
  }

  @keyframes apps-stage-marquee-left {
    to {
      transform: translateX(-50%);
    }
  }

  @keyframes apps-stage-marquee-right {
    from {
      transform: translateX(-50%);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const Mark = styled.span`
  align-items: center;
  color: ${semanticColor.inkMuted};
  display: flex;
  flex-shrink: 0;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  gap: ${spacing(2.5)};
  justify-content: center;
  letter-spacing: -0.02em;
  opacity: 0.55;
  white-space: nowrap;
  width: var(--apps-stage-marquee-slot);

  ${mediaUp('md')} {
    font-size: ${fontSize(5.5)};
  }
`;

const MarkIcon = styled.img`
  filter: grayscale(1);
  height: 28px;
  object-fit: contain;
  width: 28px;

  ${mediaUp('md')} {
    height: 32px;
    width: 32px;
  }
`;

// Enough marks per half to cover a wide screen, so the -50% loop never
// shows an edge.
const MARKS_PER_HALF = 10;

type StageStyle = CSSProperties & { '--apps-stage-marquee-slot': string };

type AppsStageMarqueeProps = {
  apps: readonly MarketplaceApp[];
};

export function AppsStageMarquee({ apps }: AppsStageMarqueeProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isOffScreen, setIsOffScreen] = useState(false);
  const appsWithLogo = apps.filter(
    (app) => app.logoUrl !== undefined && app.logoUrl.length > 0,
  );

  // Rows nobody sees should not keep the compositor busy.
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

  if (appsWithLogo.length === 0) {
    return null;
  }

  const row = (offset: number) =>
    Array.from({ length: MARKS_PER_HALF * 2 }, (_, position) => {
      const app =
        appsWithLogo[
          ((position % MARKS_PER_HALF) + offset) % appsWithLogo.length
        ];

      return (
        <Mark key={`${position}-${app.slug}`}>
          <MarkIcon alt="" src={app.logoUrl} />
          {app.name}
        </Mark>
      );
    });

  const style: StageStyle = { '--apps-stage-marquee-slot': '240px' };

  return (
    <Stage
      aria-hidden
      data-paused={isOffScreen ? '' : undefined}
      ref={stageRef}
      style={style}
    >
      <Row data-direction="left">{row(0)}</Row>
      <Row data-direction="right">
        {row(Math.floor(appsWithLogo.length / 2))}
      </Row>
    </Stage>
  );
}
