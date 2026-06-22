import { styled } from '@linaria/react';

// Purely geometric 9-slice for the brand's beveled button: rounded left cap,
// stretching middle, curved-bevel right cap. All color comes from the
// --button-fill / --button-stroke variables set by the consuming button, so
// appearance never passes through props.
const TAPER_HEIGHT = 15.477;
const TAPER_TOP_OFFSET = 4;
const RIGHT_CAP_WIDTH = 15;

const ShapeRow = styled.span`
  display: flex;
  inset: 0;
  pointer-events: none;
  position: absolute;

  svg {
    display: block;
    flex-shrink: 0;
  }

  path[data-fill] {
    fill: var(--button-fill, transparent);
  }

  path[data-stroke] {
    fill: none;
    stroke: var(--button-stroke, transparent);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1;
  }
`;

const Middle = styled.span`
  background-color: var(--button-fill, transparent);
  border-block: 1px solid var(--button-stroke, transparent);
  flex-grow: 1;
  margin-inline: -0.5px;
  min-width: 0;
`;

const leftFillPath = (height: number): string =>
  `M4 0 A4 4 0 0 0 0 4 V${height - 4} A4 4 0 0 0 4 ${height} Z`;

const leftStrokePath = (height: number): string =>
  `M4 0.5 A3.5 3.5 0 0 0 0.5 4 V${height - 4} A3.5 3.5 0 0 0 4 ${height - 0.5}`;

const rightFillPath = (height: number): string => {
  const straight = Math.max(height - TAPER_TOP_OFFSET - TAPER_HEIGHT, 0);
  return `M0 0 h11 a4 4 0 0 1 4 4 v${straight} a6 6 0 0 1 -1.544 4.019 l-8.548 9.477 A6 6 0 0 1 0.453 ${height} H0 Z`;
};

const rightStrokePath = (height: number): string => {
  const straight = Math.max(height - TAPER_TOP_OFFSET - TAPER_HEIGHT, 0);
  return `M0 0.5 h11 a3.5 3.5 0 0 1 3.5 3.5 v${straight} a5.5 5.5 0 0 1 -1.416 3.684 l-8.547 9.477 a5.5 5.5 0 0 1 -4.084 1.816 H0`;
};

export type ButtonShapeProps = {
  heightPx: number;
  outlined?: boolean;
};

export function ButtonShape({ heightPx, outlined = false }: ButtonShapeProps) {
  return (
    <ShapeRow aria-hidden>
      <svg
        height={heightPx}
        viewBox={`0 0 4 ${heightPx}`}
        width="4"
        xmlns="http://www.w3.org/2000/svg"
      >
        {outlined ? (
          <path d={leftStrokePath(heightPx)} data-stroke />
        ) : (
          <path d={leftFillPath(heightPx)} data-fill />
        )}
      </svg>
      <Middle />
      <svg
        height={heightPx}
        viewBox={`0 0 ${RIGHT_CAP_WIDTH} ${heightPx}`}
        width={RIGHT_CAP_WIDTH}
        xmlns="http://www.w3.org/2000/svg"
      >
        {outlined ? (
          <path d={rightStrokePath(heightPx)} data-stroke />
        ) : (
          <path d={rightFillPath(heightPx)} data-fill />
        )}
      </svg>
    </ShapeRow>
  );
}
