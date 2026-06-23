import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

const shell = PRODUCT_STEPPER_SCENE.shell;

type Point = { x: number; y: number };

export type DrawEdgeProps = {
  circleRadius?: number;
  elbow?: 'horizontal-first' | 'vertical-first';
  from: Point;
  highlighted: boolean;
  to: Point;
};

// One elbow connector between two card centers: near-aligned points draw
// straight, others elbow in the requested order; endpoints get dots.
export function DrawEdge({
  circleRadius = 2,
  elbow = 'vertical-first',
  from,
  highlighted,
  to,
}: DrawEdgeProps) {
  const color = highlighted ? shell.borderStrong : shell.borderMedium;
  const deltaX = Math.abs(to.x - from.x);
  const deltaY = Math.abs(to.y - from.y);

  let pathD: string;
  let startX = from.x;
  let startY = from.y;
  let endX = to.x;
  let endY = to.y;

  if (deltaX < 30) {
    const averageX = (from.x + to.x) / 2;
    startX = averageX;
    endX = averageX;
    pathD = `M${averageX},${from.y} L${averageX},${to.y}`;
  } else if (deltaY < 30) {
    const averageY = (from.y + to.y) / 2;
    startY = averageY;
    endY = averageY;
    pathD = `M${from.x},${averageY} L${to.x},${averageY}`;
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
      <circle cx={startX} cy={startY} fill={color} r={circleRadius} />
      <circle cx={endX} cy={endY} fill={color} r={circleRadius} />
    </g>
  );
}
