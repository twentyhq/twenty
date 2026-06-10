import { color } from '@/tokens';

const FOOTER_SHAPE_PATH =
  'M0 4a4 4 0 0 1 4-4h344.32c4.197 0 8.369.66 12.361 1.958l49.5 16.084A40 40 0 0 0 422.542 20h517.7c4.293 0 8.559-.691 12.633-2.047l47.785-15.906A40 40 0 0 1 1013.29 0H1356a4 4 0 0 1 4 4v16H0z';

// The card's sculpted top edge: an SVG cap row plus a solid fill below it
// (1px overlap prevents subpixel seams).
export function FooterShape() {
  return (
    <div
      aria-hidden
      style={{
        inset: 0,
        pointerEvents: 'none',
        position: 'absolute',
        zIndex: -1,
      }}
    >
      <svg
        fill="none"
        height="20"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
        viewBox="0 0 1360 20"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={FOOTER_SHAPE_PATH} fill={color('white')} />
      </svg>
      <div
        style={{
          backgroundColor: color('white'),
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 19,
        }}
      />
    </div>
  );
}
