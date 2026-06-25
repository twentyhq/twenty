import { styled } from '@linaria/react';

import {
  buildSchemeDeclarations,
  MAX_CONTENT_WIDTH_PX,
  type Scheme,
  semanticColor,
} from '@/tokens';

const CAP_HEIGHT_PX = 20;

const LEFT_SLOPE_WIDTH_PX = 74;
const RIGHT_SLOPE_WIDTH_PX = 73;

const LEFT_FLAT_GROW = 344;
const NOTCH_GROW = 518;
const RIGHT_FLAT_GROW = 343;

const NOTCH_MAX_WIDTH_PX = Math.round(
  (NOTCH_GROW / (LEFT_FLAT_GROW + NOTCH_GROW + RIGHT_FLAT_GROW)) *
    (MAX_CONTENT_WIDTH_PX - LEFT_SLOPE_WIDTH_PX - RIGHT_SLOPE_WIDTH_PX),
);

const LEFT_SLOPE_PATH =
  'M0 0 C4.197 0 8.369 0.66 12.361 1.958 L61.861 18.042 A40 40 0 0 0 74.222 20 L0 20 Z';
const RIGHT_SLOPE_PATH =
  'M0 20 A40 40 0 0 1 12.63 17.953 L60.418 2.047 A40 40 0 0 1 73.048 0 L73.048 20 Z';

const ShapeRow = styled.div`
  display: flex;
  height: ${CAP_HEIGHT_PX}px;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;

  svg {
    display: block;
    flex-shrink: 0;
    margin-inline: -1px;
    position: relative;
  }
`;

const FlatRun = styled.div`
  background-color: ${semanticColor.surface};
  flex-basis: 0;
  min-width: 0;

  &[data-edge='left'] {
    flex-grow: ${LEFT_FLAT_GROW};
  }

  &[data-edge='right'] {
    flex-grow: ${RIGHT_FLAT_GROW};
  }
`;

const Plateau = styled.div`
  flex-basis: 0;
  flex-grow: ${NOTCH_GROW};
  max-width: ${NOTCH_MAX_WIDTH_PX}px;
  min-width: 0;
`;

const BodyFill = styled.div`
  background-color: ${semanticColor.surface};
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: ${CAP_HEIGHT_PX - 1}px;
`;

const ShapeLayer = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: -1;

  &[data-card-scheme='light'] {
    ${buildSchemeDeclarations('light')}
  }

  &[data-card-scheme='muted'] {
    ${buildSchemeDeclarations('muted')}
  }

  &[data-card-scheme='dark'] {
    ${buildSchemeDeclarations('dark')}
  }
`;

export function NotchedCardShape({
  cardScheme = 'light',
}: {
  cardScheme?: Scheme;
}) {
  return (
    <ShapeLayer aria-hidden data-card-scheme={cardScheme}>
      <ShapeRow>
        <FlatRun data-edge="left" />
        <svg
          fill="none"
          height={CAP_HEIGHT_PX}
          preserveAspectRatio="none"
          viewBox={`0 0 74.222 ${CAP_HEIGHT_PX}`}
          width={LEFT_SLOPE_WIDTH_PX}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={LEFT_SLOPE_PATH} fill={semanticColor.surface} />
        </svg>
        <Plateau />
        <svg
          fill="none"
          height={CAP_HEIGHT_PX}
          preserveAspectRatio="none"
          viewBox={`0 0 73.048 ${CAP_HEIGHT_PX}`}
          width={RIGHT_SLOPE_WIDTH_PX}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={RIGHT_SLOPE_PATH} fill={semanticColor.surface} />
        </svg>
        <FlatRun data-edge="right" />
      </ShapeRow>
      <BodyFill />
    </ShapeLayer>
  );
}
