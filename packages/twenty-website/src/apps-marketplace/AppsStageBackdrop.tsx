import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { color, DURATION, EASING, mediaUp, REDUCED_MOTION } from '@/tokens';

// PROTOTYPE (?direction=d): the stage light behind the logo row. Three layers,
// back to front: a soft spot, the asset slot, a halftone dash field.
const Layers = styled.div`
  /* The light follows the logos: higher on small screens, where they stack. */
  --apps-stage-light-y: 24%;
  --apps-stage-dash-reach: 60% 22%;
  inset: 0;
  position: absolute;

  ${mediaUp('md')} {
    --apps-stage-light-y: 42%;
    --apps-stage-dash-reach: 36% 30%;
  }
`;

const Spot = styled.div`
  animation: apps-stage-light-enter calc(${DURATION.xl} * 3) ${EASING.gentle}
    both;
  background:
    radial-gradient(
      ellipse 46% 42% at 50% var(--apps-stage-light-y),
      ${color('white-10')},
      transparent 70%
    ),
    radial-gradient(
      ellipse 90% 60% at 50% 0%,
      ${color('white-5')},
      transparent 70%
    );
  inset: 0;
  position: absolute;

  @keyframes apps-stage-light-enter {
    from {
      opacity: 0;
      transform: translateY(-48px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

// 3D ASSET SLOT: Thomas's 3D asset goes here (pass it as "asset"). It sits
// between the spot and the dashes, so it can join the light or replace it.
const AssetSlot = styled.div`
  inset: 0;
  position: absolute;
`;

// Twenty's halftone, drawn in CSS, tone on tone (dark grey on black) and kept
// off the title: rows of dashes, longer where the light is stronger. Two fields share the rows; each is cut by its own ellipse.
const Dashes = styled.div`
  animation: apps-stage-dashes-enter calc(${DURATION.xl} * 4) ${EASING.gentle}
    both;
  background-image: repeating-linear-gradient(
    0deg,
    transparent 0 7px,
    ${color('graphite')} 7px 9px
  );
  inset: 0;
  mask-composite: intersect;
  position: absolute;

  &[data-tone='strong'] {
    mask-image:
      repeating-linear-gradient(
        90deg,
        ${color('black')} 0 12px,
        transparent 12px 18px
      ),
      radial-gradient(
        ellipse var(--apps-stage-dash-reach) at 50% var(--apps-stage-light-y),
        ${color('black')} 0%,
        transparent 70%
      );
  }

  &[data-tone='soft'] {
    display: none;
    mask-image:
      repeating-linear-gradient(
        90deg,
        ${color('black')} 0 4px,
        transparent 4px 18px
      ),
      radial-gradient(
        ellipse 62% 44% at 50% 36%,
        ${color('black')} 0%,
        transparent 72%
      );

    ${mediaUp('md')} {
      display: block;
    }
  }

  @keyframes apps-stage-dashes-enter {
    from {
      opacity: 0;
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

type AppsStageBackdropProps = {
  asset?: ReactNode;
};

export function AppsStageBackdrop({ asset }: AppsStageBackdropProps) {
  return (
    <Layers>
      <Spot />
      <AssetSlot>{asset}</AssetSlot>
      <Dashes data-tone="soft" />
      <Dashes data-tone="strong" />
    </Layers>
  );
}
