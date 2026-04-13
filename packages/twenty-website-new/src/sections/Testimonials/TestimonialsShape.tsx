const TESTIMONIALS_SHAPE_CLIP_PATH =
  'polygon(0% 20%, 0.294% 0%, 25.318% 0%, 31.069% 100%, 69.135% 100%, 74.507% 0%, 99.706% 0%, 100% 20%, 100% 100%, 0% 100%)';

interface TestimonialsShapeProps {
  bodyFillColor?: string;
  fillColor: string;
}

export function TestimonialsShape({
  bodyFillColor,
  fillColor,
}: TestimonialsShapeProps) {
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
      <div
        style={{
          backgroundColor: fillColor,
          clipPath: TESTIMONIALS_SHAPE_CLIP_PATH,
          height: 20,
          left: 0,
          overflow: 'hidden',
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 19,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: bodyFillColor ?? fillColor,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
        }}
      />
    </div>
  );
}
