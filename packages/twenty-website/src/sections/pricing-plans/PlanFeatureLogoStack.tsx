import { styled } from '@linaria/react';

import { color, radius } from '@/tokens';

import { type PlanFeatureLogos } from './plans-data';

const STACK_SIZE_PX = 28;
const LOGO_SIZE_PX = 18;

type LogoPosition = { x: number; y: number };

const LOGO_POSITIONS_BY_COUNT: Record<
  PlanFeatureLogos['length'],
  LogoPosition[]
> = {
  1: [{ x: 5, y: 5 }],
  2: [
    { x: 1.5, y: 8.5 },
    { x: 8.5, y: 1.5 },
  ],
  3: [
    { x: 0, y: 9 },
    { x: 10, y: 4.5 },
    { x: 2, y: 0 },
  ],
};

const Stack = styled.span`
  display: block;
  flex-shrink: 0;
  height: ${STACK_SIZE_PX}px;
  position: relative;
  width: ${STACK_SIZE_PX}px;
`;

const StackedLogo = styled.img`
  background-color: ${color('white')};
  box-shadow: 0 0 0 1.5px ${color('white')};
  display: block;
  height: ${LOGO_SIZE_PX}px;
  position: absolute;
  width: ${LOGO_SIZE_PX}px;

  &[data-shape='circle'] {
    border-radius: 50%;
  }

  &[data-shape='square'] {
    border-radius: ${radius(1.5)};
  }
`;

export function PlanFeatureLogoStack({ logos }: { logos: PlanFeatureLogos }) {
  const positions = LOGO_POSITIONS_BY_COUNT[logos.length];

  return (
    <Stack>
      {logos.map((logo, depth) => {
        const position = positions[depth];

        return (
          <StackedLogo
            alt={logo.alt}
            data-shape={logo.shape}
            decoding="async"
            key={logo.src}
            loading="lazy"
            src={logo.src}
            style={{
              left: position.x,
              top: position.y,
              zIndex: logos.length - depth,
            }}
          />
        );
      })}
    </Stack>
  );
}
