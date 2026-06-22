import { WORKFLOW_THEME } from './workflow-theme';
import { type WorkflowEdgeDef } from '../../types';

// Pure path math for the node graph's edges, ported verbatim. Ports sit
// at the node's top/bottom center (+1px under the border) and right
// center; every corner turns through an 8px arc.
type Point = { x: number; y: number };

export type PositionedWorkflowNode = {
  id: string;
  x: number;
  y: number;
  width: number;
};

const CORNER_RADIUS = 8;
const NODE_HEIGHT = WORKFLOW_THEME.nodeHeightPx;

function getNodeById(
  nodes: ReadonlyArray<PositionedWorkflowNode>,
  nodeId: string,
): PositionedWorkflowNode {
  const node = nodes.find((workflowNode) => workflowNode.id === nodeId);
  if (!node) {
    throw new Error(`Unknown workflow node: ${nodeId}`);
  }
  return node;
}

function getNodeTopCenter(node: PositionedWorkflowNode): Point {
  return { x: node.x + node.width / 2, y: node.y };
}

function getNodeBottomCenter(node: PositionedWorkflowNode): Point {
  return { x: node.x + node.width / 2, y: node.y + NODE_HEIGHT + 1 };
}

function getNodeRightCenter(node: PositionedWorkflowNode): Point {
  return { x: node.x + node.width, y: node.y + NODE_HEIGHT / 2 };
}

function getRightDownPath(
  fromNode: PositionedWorkflowNode,
  toNode: PositionedWorkflowNode,
): string {
  const start = getNodeRightCenter(fromNode);
  const end = getNodeTopCenter(toNode);
  const r = CORNER_RADIUS;
  return [
    `M${start.x} ${start.y}`,
    `L${end.x - r} ${start.y}`,
    `A${r} ${r} 0 0 1 ${end.x} ${start.y + r}`,
    `L${end.x} ${end.y}`,
  ].join(' ');
}

function getLoopBackPath(
  fromNode: PositionedWorkflowNode,
  toNode: PositionedWorkflowNode,
): string {
  const r = CORNER_RADIUS;
  const padRight = 40;
  const padBottom = 180;
  const start = getNodeBottomCenter(fromNode);
  const endX = toNode.x + toNode.width / 2;
  const endY = toNode.y + NODE_HEIGHT + 50;
  const rightX = fromNode.x + fromNode.width + padRight;
  const bottomY = start.y + padBottom;
  return [
    `M${start.x} ${start.y}`,
    `L${start.x} ${bottomY - r}`,
    `A${r} ${r} 0 0 0 ${start.x + r} ${bottomY}`,
    `L${rightX - r} ${bottomY}`,
    `A${r} ${r} 0 0 0 ${rightX} ${bottomY - r}`,
    `L${rightX} ${endY + r}`,
    `A${r} ${r} 0 0 0 ${rightX - r} ${endY}`,
    `L${endX} ${endY}`,
  ].join(' ');
}

function getSmoothStepPath(start: Point, end: Point): string {
  const r = CORNER_RADIUS;
  const midY = start.y + (end.y - start.y) * 0.4;
  if (Math.abs(start.x - end.x) < 2) {
    return `M${start.x} ${start.y} L${end.x} ${end.y}`;
  }
  const goingRight = end.x > start.x;
  return [
    `M${start.x} ${start.y}`,
    `L${start.x} ${midY - r}`,
    `A${r} ${r} 0 0 ${goingRight ? 0 : 1} ${start.x + (goingRight ? r : -r)} ${midY}`,
    `L${end.x - (goingRight ? r : -r)} ${midY}`,
    `A${r} ${r} 0 0 ${goingRight ? 1 : 0} ${end.x} ${midY + r}`,
    `L${end.x} ${end.y}`,
  ].join(' ');
}

export function getWorkflowEdgePath({
  edge,
  nodes,
}: {
  edge: WorkflowEdgeDef;
  nodes: ReadonlyArray<PositionedWorkflowNode>;
}): string {
  const fromNode = getNodeById(nodes, edge.from);
  const toNode = getNodeById(nodes, edge.to);
  if (edge.type === 'loopRight') {
    return getRightDownPath(fromNode, toNode);
  }
  if (edge.type === 'loopBack') {
    return getLoopBackPath(fromNode, toNode);
  }
  const start = getNodeBottomCenter(fromNode);
  const end = getNodeTopCenter(toNode);
  if (edge.type === 'vertical') {
    return `M${start.x} ${start.y} L${end.x} ${end.y}`;
  }
  if (edge.type === 'smoothStep') {
    return getSmoothStepPath(start, end);
  }
  const controlStartY = start.y + 28;
  const controlEndY = end.y - 28;
  return `M${start.x} ${start.y} C${start.x} ${controlStartY} ${end.x} ${controlEndY} ${end.x} ${end.y}`;
}
