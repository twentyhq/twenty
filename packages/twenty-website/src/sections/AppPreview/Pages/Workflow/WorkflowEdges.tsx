import { styled } from '@linaria/react';

import type {
  WorkflowEdgeDefinition,
  WorkflowNodeDefinition,
} from './workflow-page-data';
import { getWorkflowEdgePath } from './workflow-page-geometry';
import {
  WORKFLOW_CANVAS_HEIGHT,
  WORKFLOW_CANVAS_WIDTH,
  WORKFLOW_NODE_HEIGHT,
  WORKFLOW_PAGE_COLORS,
} from './workflow-page-theme';
import { getWorkflowNodeById } from './get-workflow-node-by-id';

const CanvasOverlay = styled.svg`
  inset: 0;
  overflow: visible;
  pointer-events: none;
  position: absolute;
`;

export function WorkflowEdges({
  edges,
  nodes,
  plusNode,
}: {
  edges: ReadonlyArray<WorkflowEdgeDefinition>;
  nodes: ReadonlyArray<WorkflowNodeDefinition>;
  plusNode?: { x: number; y: number };
}) {
  const completedEdge = edges.find((e) => e.type === 'loopRight');
  const completedSourceNode = completedEdge
    ? getWorkflowNodeById(nodes, completedEdge.from)
    : undefined;

  return (
    <CanvasOverlay
      aria-hidden
      viewBox={`0 0 ${WORKFLOW_CANVAS_WIDTH} ${WORKFLOW_CANVAS_HEIGHT}`}
    >
      <defs>
        <marker
          id="workflow-arrow"
          markerHeight="6"
          markerWidth="6"
          orient="auto"
          refX="5"
          refY="3"
        >
          <path
            d="M0.75 0.75 L5 3 L0.75 5.25"
            fill="none"
            stroke={WORKFLOW_PAGE_COLORS.arrowStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.1"
          />
        </marker>
      </defs>
      {edges.map((edge) => (
        <path
          key={`${edge.from}-${edge.to}-${edge.type}`}
          d={getWorkflowEdgePath({ edge, nodes })}
          fill="none"
          markerEnd={
            edge.type === 'loopBack' ? undefined : 'url(#workflow-arrow)'
          }
          stroke={WORKFLOW_PAGE_COLORS.arrowStroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        />
      ))}
      {plusNode && completedSourceNode && (
        <path
          d={`M${completedSourceNode.x + completedSourceNode.width / 2} ${completedSourceNode.y + WORKFLOW_NODE_HEIGHT + 1} L${plusNode.x} ${plusNode.y}`}
          fill="none"
          stroke={WORKFLOW_PAGE_COLORS.arrowStroke}
          strokeDasharray="4 3"
          strokeLinecap="round"
          strokeWidth="1"
        />
      )}
      {nodes.map((node) => {
        const cx = node.x + node.width / 2;
        const bottomY = node.y + WORKFLOW_NODE_HEIGHT + 1;
        const rightX = node.x + node.width;
        const midY = node.y + WORKFLOW_NODE_HEIGHT / 2;

        return (
          <g key={`ports-${node.id}`}>
            <circle
              cx={cx}
              cy={node.y}
              fill={WORKFLOW_PAGE_COLORS.nodeSurface}
              r="4"
              stroke={WORKFLOW_PAGE_COLORS.nodeBorder}
              strokeWidth="1"
            />
            <circle
              cx={cx}
              cy={bottomY}
              fill={WORKFLOW_PAGE_COLORS.nodeSurface}
              r="4"
              stroke={WORKFLOW_PAGE_COLORS.nodeBorder}
              strokeWidth="1"
            />
            <circle
              cx={rightX}
              cy={midY}
              fill={WORKFLOW_PAGE_COLORS.nodeSurface}
              r="4"
              stroke={WORKFLOW_PAGE_COLORS.nodeBorder}
              strokeWidth="1"
            />
          </g>
        );
      })}
    </CanvasOverlay>
  );
}
