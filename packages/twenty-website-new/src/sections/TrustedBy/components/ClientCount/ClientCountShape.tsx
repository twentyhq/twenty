import { styled } from "@linaria/react";

interface ClientCountShapeProps {
  strokeColor: string;
}

const LEFT_OUTLINE = "M4 0.5 A3.5 3.5 0 0 0 0.5 4 V44 A3.5 3.5 0 0 0 4 47.5";

const RIGHT_OUTLINE =
  "M0 0.5 h11 a3.5 3.5 0 0 1 3.5 3.5 v28.523 a5.5 5.5 0 0 1 -1.416 3.684 l-8.547 9.477 a5.5 5.5 0 0 1 -4.084 1.816 H0";

const ShapeContainer = styled.div`
  display: flex;
  height: 48px;
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

export function ClientCountShape({ strokeColor }: ClientCountShapeProps) {
  return (
    <ShapeContainer>
      <LeftCap
        width="4"
        height="48"
        viewBox="0 0 4 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={LEFT_OUTLINE}
          stroke={strokeColor}
          strokeWidth="1"
        />
      </LeftCap>

      <MiddleSegment
        width="100%"
        height="48"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="0"
          y1="0.5"
          x2="100%"
          y2="0.5"
          stroke={strokeColor}
          strokeWidth="1"
        />
        <line
          x1="0"
          y1="47.5"
          x2="100%"
          y2="47.5"
          stroke={strokeColor}
          strokeWidth="1"
        />
      </MiddleSegment>

      <RightCap
        width="15"
        height="48"
        viewBox="0 0 15 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={RIGHT_OUTLINE}
          stroke={strokeColor}
          strokeWidth="1"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </RightCap>
    </ShapeContainer>
  );
}
