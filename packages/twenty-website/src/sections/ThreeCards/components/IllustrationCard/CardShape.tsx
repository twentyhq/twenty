const THREE_CARDS_CARD_SHAPE_FILL_PATH =
  'M0 490V4a4 4 0 0 1 4-4h288.23c.932 0 1.856.163 2.731.48l60.814 22.09c.875.318 1.8.48 2.731.48H439a4 4 0 0 1 4 4V490a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4';

const THREE_CARDS_CARD_SHAPE_STROKE_PATH =
  'M4 .5h288.23c.874 0 1.74.152 2.561.45l60.813 22.09c.931.338 1.912.51 2.902.51H439a3.5 3.5 0 0 1 3.5 3.5V490a3.5 3.5 0 0 1-3.5 3.5H4A3.5 3.5 0 0 1 .5 490V4A3.5 3.5 0 0 1 4 .5Z';

interface ThreeCardsCardShapeProps {
  fillColor: string;
  strokeColor: string;
}

export function ThreeCardsCardShape({
  fillColor,
  strokeColor,
}: ThreeCardsCardShapeProps) {
  return (
    <div
      aria-hidden
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 443 494"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <path d={THREE_CARDS_CARD_SHAPE_FILL_PATH} fill={fillColor} />
        <path d={THREE_CARDS_CARD_SHAPE_STROKE_PATH} stroke={strokeColor} />
      </svg>
    </div>
  );
}
