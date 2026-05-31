import {
  STEPPER_BORDER_MEDIUM,
  STEPPER_BORDER_STRONG,
} from './stepper-visual-tokens';

type Point = { x: number; y: number };

type DrawEdgeProps = {
  circleR?: number;
  elbow?: 'horizontal-first' | 'vertical-first';
  from: Point;
  highlighted: boolean;
  to: Point;
};

export function DrawEdge({
  circleR = 2,
  elbow = 'vertical-first',
  from,
  highlighted,
  to,
}: DrawEdgeProps) {
  const color = highlighted ? STEPPER_BORDER_STRONG : STEPPER_BORDER_MEDIUM;
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);

  let pathD: string;
  let startX = from.x;
  let startY = from.y;
  let endX = to.x;
  let endY = to.y;

  if (dx < 30) {
    const avgX = (from.x + to.x) / 2;
    startX = avgX;
    endX = avgX;
    pathD = `M${avgX},${from.y} L${avgX},${to.y}`;
  } else if (dy < 30) {
    const avgY = (from.y + to.y) / 2;
    startY = avgY;
    endY = avgY;
    pathD = `M${from.x},${avgY} L${to.x},${avgY}`;
  } else if (elbow === 'horizontal-first') {
    pathD = `M${from.x},${from.y} L${to.x},${from.y} L${to.x},${to.y}`;
  } else {
    pathD = `M${from.x},${from.y} L${from.x},${to.y} L${to.x},${to.y}`;
  }

  return (
    <g>
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={0.75}
        style={{ transition: 'stroke 0.15s' }}
      />
      <circle cx={startX} cy={startY} fill={color} r={circleR} />
      <circle cx={endX} cy={endY} fill={color} r={circleR} />
    </g>
  );
}
