import { WORKFLOW_NODE_HEIGHT } from './workflow-page-theme';
import type {
  WorkflowEdgeDefinition,
  WorkflowNodeDefinition,
} from './workflow-page-data';
import { getWorkflowNodeById } from './get-workflow-node-by-id';

type Point = {
  x: number;
  y: number;
};

function getNodeTopCenter(node: WorkflowNodeDefinition): Point {
  return {
    x: node.x + node.width / 2,
    y: node.y,
  };
}

function getNodeBottomCenter(node: WorkflowNodeDefinition): Point {
  return {
    x: node.x + node.width / 2,
    y: node.y + WORKFLOW_NODE_HEIGHT + 1,
  };
}

export function getWorkflowEdgePath({
  edge,
  nodes,
}: {
  edge: WorkflowEdgeDefinition;
  nodes: ReadonlyArray<WorkflowNodeDefinition>;
}) {
  const fromNode = getWorkflowNodeById(nodes, edge.from);
  const toNode = getWorkflowNodeById(nodes, edge.to);
  const start = getNodeBottomCenter(fromNode);
  const end = getNodeTopCenter(toNode);

  if (edge.type === 'vertical') {
    return `M${start.x} ${start.y} L${end.x} ${end.y}`;
  }

  const controlStartY = start.y + 28;
  const controlEndY = end.y - 28;

  return `M${start.x} ${start.y} C${start.x} ${controlStartY} ${end.x} ${controlEndY} ${end.x} ${end.y}`;
}
