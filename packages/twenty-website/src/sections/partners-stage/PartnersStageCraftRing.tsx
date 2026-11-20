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

// PROTOTYPE (?direction=e): the partners' marks standing on a floor tilted
// 48°, turning once every 100 s. Copy of the /apps ring (AppsStageRing).
const SLOT_COUNT = 24;
const FRONT_SLOT_INDEX = SLOT_COUNT / 2;
const RING_RADIUS_PX = 550;

const Stage = styled.div`
  --partners-stage-ring-scale: 0.46;
  --partners-stage-ring-top: 490px;
  inset: 0;
  mask-image: linear-gradient(
    to bottom,
    transparent 70%,
    ${color('black')} 80%
  );
  overflow: hidden;
  pointer-events: none;
  position: absolute;

  ${mediaUp('sm')} {
    --partners-stage-ring-scale: 0.7;
    --partners-stage-ring-top: 360px;
    mask-image: linear-gradient(
      to bottom,
      transparent 62%,
      ${color('black')} 74%
    );
  }

  ${mediaUp('md')} {
    --partners-stage-ring-scale: 1;
    --partners-stage-ring-top: 290px;
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
  top: var(--partners-stage-ring-top);
  transform: scale(var(--partners-stage-ring-scale));
  transform-style: preserve-3d;
  width: 0;
`;

const Floor = styled.div`
  animation: partners-stage-ring-spin 100s linear infinite;
  height: 0;
  left: 0;
  position: absolute;
  top: 0;
  transform: rotateX(48deg) rotateZ(0deg);
  transform-style: preserve-3d;
  width: 0;

  @keyframes partners-stage-ring-spin {
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
  transform: rotate(var(--partners-stage-slot-angle))
    translateY(-${RING_RADIUS_PX}px) rotate(180deg);
  transform-origin: 0 0;
`;

// Partner marks are square images on their own ground: they fill the tile.
const Tile = styled.div`
  animation: partners-stage-ring-tile-in ${DURATION.xl} ${EASING.standard}
    calc(120ms + var(--partners-stage-slot-distance) * 45ms) both;
  background-color: ${color('white')};
  border-radius: ${radius(3)};
  box-shadow: inset 0 0 0 1px ${color('white-10')};
  clip-path: polygon(0 0, 100% 0, 100% 82%, 82% 100%, 0 100%);
  height: 104px;
  left: -52px;
  overflow: hidden;
  position: absolute;
  top: -52px;
  width: 104px;

  @keyframes partners-stage-ring-tile-in {
    from {
      opacity: 0;
      transform: scale(0.72);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const Mark = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

type SlotStyle = CSSProperties & {
  '--partners-stage-slot-angle': string;
  '--partners-stage-slot-distance': number;
};

type PartnersStageCraftRingProps = {
  markUrls: readonly string[];
};

export function PartnersStageCraftRing({
  markUrls,
}: PartnersStageCraftRingProps) {
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

  return (
    <Stage
      aria-hidden
      data-paused={isOffScreen ? '' : undefined}
      ref={stageRef}
    >
      <Scaler>
        <Floor>
          {markUrls.length > 0 &&
            Array.from({ length: SLOT_COUNT }, (_, slotIndex) => {
              const offset = Math.abs(slotIndex - FRONT_SLOT_INDEX);
              const style: SlotStyle = {
                '--partners-stage-slot-angle': `${(360 / SLOT_COUNT) * slotIndex}deg`,
                '--partners-stage-slot-distance': Math.min(
                  offset,
                  SLOT_COUNT - offset,
                ),
              };

              return (
                <Slot key={slotIndex} style={style}>
                  <Tile>
                    <Mark
                      alt=""
                      decoding="async"
                      src={markUrls[slotIndex % markUrls.length]}
                    />
                  </Tile>
                </Slot>
              );
            })}
        </Floor>
      </Scaler>
    </Stage>
  );
}
