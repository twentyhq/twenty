import { COLORS, CursorGlyph, TomCursorGlyph } from './live-data-visual.styles';

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

export function TomCursor() {
  return (
    <TomCursorGlyph
      fill="none"
      viewBox="0 0 40.7459 37.7835"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M39.2312 0.0359766C40.2403 -0.208095 41.0759 0.836037 40.6166 1.76715L23.188 37.1009C22.7265 38.0363 21.3815 38.003 20.967 37.0458L14.3553 21.777C14.2684 21.5764 14.1294 21.4027 13.9528 21.274L0.503957 11.477C-0.339096 10.8629 -0.0768831 9.54315 0.936912 9.29795L39.2312 0.0359766Z"
        fill={COLORS.orange}
      />
    </TomCursorGlyph>
  );
}
