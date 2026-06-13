import { styled } from '@linaria/react';

import { buildSchemeDeclarations, type Scheme, semanticColor } from '@/tokens';

// A card with the sculpted notched top edge — shared by the footer stage card
// and the testimonials card. The card presents a surface scheme: its fill is
// that scheme's surface (light → white, dark → black). On a light section a
// dark card reads as a dark panel whose notch reveals the white surface behind
// it. The old site stretched one 1360px-wide path with
// preserveAspectRatio="none", distorting the notch slopes at every other width.
// Here the slopes keep their authored geometry (fixed-width SVG caps extracted
// from the original path) and only the flat runs flex, in the original
// 344 : 518 : 343 proportions.
const CAP_HEIGHT_PX = 20;

const LEFT_SLOPE_WIDTH_PX = 74;
const RIGHT_SLOPE_WIDTH_PX = 73;

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
    flex-grow: 344;
  }

  &[data-edge='right'] {
    flex-grow: 343;
  }
`;

const Plateau = styled.div`
  flex-basis: 0;
  flex-grow: 518;
  min-width: 0;
`;

const BodyFill = styled.div`
  background-color: ${semanticColor.surface};
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  /* 1px overlap with the cap row prevents subpixel seams. */
  top: ${CAP_HEIGHT_PX - 1}px;
`;

// The card carries its own surface scheme so its fill is independent of the
// host section's scheme — a white card on a muted section, a black card on a
// light one. The shape draws no text, so it adopts only the scheme variables
// (it reads `surface`); the ink colour belongs to its content, not the shape.
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
