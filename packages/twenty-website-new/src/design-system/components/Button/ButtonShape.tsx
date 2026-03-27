import { styled } from "@linaria/react";

interface ButtonShapeProps {
  fillColor: string;
  strokeColor: string;
}

const LEFT_FILL = "M4 0 A4 4 0 0 0 0 4 V36 A4 4 0 0 0 4 40 Z";
const LEFT_OUTLINE = "M4 0.5 A3.5 3.5 0 0 0 0.5 4 V36 A3.5 3.5 0 0 0 4 39.5";

const RIGHT_FILL = "M0 0 h11 a4 4 0 0 1 4 4 v20.523 a6 6 0 0 1 -1.544 4.019 l-8.548 9.477 A6 6 0 0 1 0.453 40 H0 Z";
const RIGHT_OUTLINE = "M0 0.5 h11 a3.5 3.5 0 0 1 3.5 3.5 v20.523 a5.5 5.5 0 0 1 -1.416 3.684 l-8.547 9.477 a5.5 5.5 0 0 1 -4.084 1.816 H0";

const ShapeContainer = styled.div`
  display: flex;
  height: 40px;
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

export function ButtonShape({ fillColor, strokeColor }: ButtonShapeProps) {
  const isOutline = fillColor === "none";

  return (
    <ShapeContainer>
      <LeftCap width="4" height="40" viewBox="0 0 4 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {isOutline ? (
          <path d={LEFT_OUTLINE} fill={fillColor} stroke={strokeColor} strokeWidth="1" />
        ) : (
          <path d={LEFT_FILL} fill={fillColor} stroke={strokeColor} />
        )}
      </LeftCap>

      <MiddleSegment width="100%" height="40" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
        {isOutline ? (
          <>
            <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke={strokeColor} strokeWidth="1" />
            <line x1="0" y1="39.5" x2="100%" y2="39.5" stroke={strokeColor} strokeWidth="1" />
          </>
        ) : (
          <rect width="100%" height="40" fill={fillColor} stroke={strokeColor} />
        )}
      </MiddleSegment>

      <RightCap width="15" height="40" viewBox="0 0 15 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {isOutline ? (
          <path d={RIGHT_OUTLINE} fill={fillColor} stroke={strokeColor} strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />
        ) : (
          <path d={RIGHT_FILL} fill={fillColor} stroke={strokeColor} />
        )}
      </RightCap>
    </ShapeContainer>
  );
}
