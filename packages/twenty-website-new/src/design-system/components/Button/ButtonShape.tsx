import { styled } from '@linaria/react';

type ButtonShapeProps = {
  dataSlot?: string;
  fillColor: string;
  height: number;
  strokeColor: string;
};

// The bottom-right corner taper is a fixed design element; only the straight
// vertical segment between top-right arc and the taper changes with height.
const TAPER_HEIGHT = 15.477;
const TAPER_TOP_OFFSET = 4;
const STRAIGHT_V_AT_FORTY = 20.523;

function getLeftFillPath(height: number) {
  return `M4 0 A4 4 0 0 0 0 4 V${height - 4} A4 4 0 0 0 4 ${height} Z`;
}

function getLeftOutlinePath(height: number) {
  return `M4 0.5 A3.5 3.5 0 0 0 0.5 4 V${height - 4} A3.5 3.5 0 0 0 4 ${height - 0.5}`;
}

function getRightFillPath(height: number) {
  const straight = Math.max(
    height - TAPER_TOP_OFFSET - TAPER_HEIGHT,
    0,
  );
  return `M0 0 h11 a4 4 0 0 1 4 4 v${straight} a6 6 0 0 1 -1.544 4.019 l-8.548 9.477 A6 6 0 0 1 0.453 ${height} H0 Z`;
}

function getRightOutlinePath(height: number) {
  const straight = Math.max(
    height - TAPER_TOP_OFFSET - TAPER_HEIGHT,
    0,
  );
  return `M0 0.5 h11 a3.5 3.5 0 0 1 3.5 3.5 v${straight} a5.5 5.5 0 0 1 -1.416 3.684 l-8.547 9.477 a5.5 5.5 0 0 1 -4.084 1.816 H0`;
}

void STRAIGHT_V_AT_FORTY;

const ShapeContainer = styled.div`
  display: flex;
  inset: 0;
  pointer-events: none;
  position: absolute;
  width: 100%;
  z-index: 0;
`;

const LeftCap = styled.svg`
  display: block;
  flex-shrink: 0;
`;

const MiddleSegment = styled.svg`
  display: block;
  flex-grow: 1;
  margin: 0 -1px;
  min-width: 0;
`;

const RightCap = styled.svg`
  display: block;
  flex-shrink: 0;
`;

export function ButtonShape({
  dataSlot,
  fillColor,
  height,
  strokeColor,
}: ButtonShapeProps) {
  const isOutline = fillColor === 'none';

  return (
    <ShapeContainer data-slot={dataSlot} style={{ height }}>
      <LeftCap
        fill="none"
        height={height}
        viewBox={`0 0 4 ${height}`}
        width="4"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isOutline ? (
          <path
            d={getLeftOutlinePath(height)}
            fill={fillColor}
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
          />
        ) : (
          <path
            d={getLeftFillPath(height)}
            fill={fillColor}
            stroke={strokeColor}
          />
        )}
      </LeftCap>

      <MiddleSegment
        fill="none"
        height={height}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
      >
        {isOutline ? (
          <>
            <line
              stroke={strokeColor}
              strokeWidth="1"
              x1="0"
              x2="100%"
              y1="0.5"
              y2="0.5"
            />
            <line
              stroke={strokeColor}
              strokeWidth="1"
              x1="0"
              x2="100%"
              y1={height - 0.5}
              y2={height - 0.5}
            />
          </>
        ) : (
          <rect
            fill={fillColor}
            height={height}
            stroke={strokeColor}
            width="100%"
          />
        )}
      </MiddleSegment>

      <RightCap
        fill="none"
        height={height}
        viewBox={`0 0 15 ${height}`}
        width="15"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isOutline ? (
          <path
            d={getRightOutlinePath(height)}
            fill={fillColor}
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
          />
        ) : (
          <path
            d={getRightFillPath(height)}
            fill={fillColor}
            stroke={strokeColor}
          />
        )}
      </RightCap>
    </ShapeContainer>
  );
}
