const ENGAGEMENT_BAND_SHAPE_PATH =
  'M0 4a4 4 0 0 1 4-4h1352a4 4 0 0 1 4 4v89.502a8 8 0 0 1-2.57 5.873l-35.13 32.498a8 8 0 0 1-5.43 2.127H4a4 4 0 0 1-4-4z';

type EngagementBandShapeProps = {
  fillColor: string;
};

export function EngagementBandShape({ fillColor }: EngagementBandShapeProps) {
  return (
    <div
      aria-hidden
      style={{
        height: '100%',
        inset: 0,
        pointerEvents: 'none',
        position: 'absolute',
        width: '100%',
        zIndex: -1,
      }}
    >
      <svg
        fill="none"
        height="100%"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
        viewBox="0 0 1360 134"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={ENGAGEMENT_BAND_SHAPE_PATH} fill={fillColor} />
      </svg>
    </div>
  );
}
