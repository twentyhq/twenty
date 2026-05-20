import { styled } from '@linaria/react';

const CursorGlyph = styled.svg<{
  $height: number;
  $rotation: number;
  $width: number;
}>`
  display: block;
  filter: drop-shadow(0 2px 4px rgba(28, 28, 28, 0.12));
  height: ${({ $height }) => `${$height}px`};
  transform: ${({ $rotation }) => `rotate(${$rotation}deg)`};
  transform-origin: center;
  transition: transform 140ms ease;
  width: ${({ $width }) => `${$width}px`};
`;

export function MarkerCursor({
  color,
  height = 32,
  rotation,
  width = 29,
}: {
  color: string;
  height?: number;
  rotation: number;
  width?: number;
}) {
  return (
    <CursorGlyph
      $height={height}
      $rotation={rotation}
      $width={width}
      fill="none"
      viewBox="0 0 36 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.0238 38.4628C19.5211 39.3742 20.8559 39.2915 21.2369 38.3257L35.6951 1.67609C36.0779 0.70584 35.1494 -0.267942 34.162 0.0682245L18.411 5.43091C18.2041 5.50136 17.9821 5.51512 17.768 5.47075L1.47559 2.09311C0.454282 1.88138 -0.346937 2.96232 0.152654 3.87791L19.0238 38.4628Z"
        fill={color}
      />
    </CursorGlyph>
  );
}
