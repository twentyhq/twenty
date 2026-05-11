import { styled } from '@linaria/react';

import type {
  WorkflowEdgeDefinition,
  WorkflowNodeDefinition,
} from './workflow-page-data';
import { getWorkflowEdgePath } from './workflow-page-geometry';
import {
  WORKFLOW_CANVAS_HEIGHT,
  WORKFLOW_CANVAS_WIDTH,
  WORKFLOW_PAGE_COLORS,
} from './workflow-page-theme';

const CanvasOverlay = styled.svg`
  inset: 0;
  overflow: visible;
  pointer-events: none;
  position: absolute;
`;

export function WorkflowEdges({
  edges,
  nodes,
}: {
  edges: ReadonlyArray<WorkflowEdgeDefinition>;
  nodes: ReadonlyArray<WorkflowNodeDefinition>;
}) {
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
          key={`${edge.from}-${edge.to}`}
          d={getWorkflowEdgePath({ edge, nodes })}
          fill="none"
          markerEnd="url(#workflow-arrow)"
          stroke={WORKFLOW_PAGE_COLORS.arrowStroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        />
      ))}
    </CanvasOverlay>
  );
}
