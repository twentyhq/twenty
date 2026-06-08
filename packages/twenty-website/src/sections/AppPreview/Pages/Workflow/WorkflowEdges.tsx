import { useId } from 'react';

import { styled } from '@linaria/react';

import type {
  WorkflowEdgeDefinition,
  WorkflowNodeDefinition,
} from './workflow-page-data';
import { getWorkflowEdgePath } from './workflow-page-geometry';
import {
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

const EdgePath = styled.path`
  animation: workflowEdgeDraw 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
  stroke-dasharray: 1;

  @keyframes workflowEdgeDraw {
    from {
      opacity: 0;
      stroke-dashoffset: 1;
    }
    25% {
      opacity: 1;
    }
    to {
      opacity: 1;
      stroke-dashoffset: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const ConnectorPath = styled.path`
  animation: workflowConnectorAppear 360ms ease both;
  animation-delay: 620ms;

  @keyframes workflowConnectorAppear {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const PortsLayer = styled.g`
  animation: workflowPortsAppear 360ms ease both;
  animation-delay: 520ms;

  @keyframes workflowPortsAppear {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export function WorkflowEdges({
  canvasHeight,
  canvasWidth,
  edges,
  nodes,
  plusNode,
}: {
  canvasHeight: number;
  canvasWidth: number;
  edges: ReadonlyArray<WorkflowEdgeDefinition>;
  nodes: ReadonlyArray<WorkflowNodeDefinition>;
  plusNode?: { x: number; y: number };
}) {
  const arrowId = `workflow-arrow-${useId().replace(/:/g, '')}`;
  const completedEdge = edges.find((e) => e.type === 'loopRight');
  const completedSourceNode = completedEdge
    ? getWorkflowNodeById(nodes, completedEdge.from)
    : undefined;
  const topPortNodeIds = new Set<string>();
  const bottomPortNodeIds = new Set<string>();
  const rightPortNodeIds = new Set<string>();

  for (const edge of edges) {
    if (edge.type === 'loopRight') {
      rightPortNodeIds.add(edge.from);
      topPortNodeIds.add(edge.to);
      continue;
    }

    bottomPortNodeIds.add(edge.from);

    if (edge.type !== 'loopBack') {
      topPortNodeIds.add(edge.to);
    }
  }

  if (completedSourceNode && plusNode) {
    bottomPortNodeIds.add(completedSourceNode.id);
  }

  const completedConnectorPath =
    plusNode && completedSourceNode
      ? (() => {
          const startX = completedSourceNode.x + completedSourceNode.width / 2;
          const startY = completedSourceNode.y + WORKFLOW_NODE_HEIGHT + 1;
          const endX = plusNode.x;
          const endY = plusNode.y;
          const elbowY = endY - 14;

          if (Math.abs(startX - endX) < 1) {
            return `M${startX} ${startY} L${endX} ${endY}`;
          }

          return [
            `M${startX} ${startY}`,
            `L${startX} ${elbowY}`,
            `L${endX} ${elbowY}`,
            `L${endX} ${endY}`,
          ].join(' ');
        })()
      : undefined;

  return (
    <CanvasOverlay aria-hidden viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}>
      <defs>
        <marker
          id={arrowId}
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
      {edges.map((edge, index) => (
        <EdgePath
          key={`${edge.from}-${edge.to}-${edge.type}`}
          d={getWorkflowEdgePath({ edge, nodes })}
          fill="none"
          markerEnd={
            edge.type === 'loopBack' ? undefined : `url(#${arrowId})`
          }
          pathLength={1}
          stroke={WORKFLOW_PAGE_COLORS.arrowStroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          style={{ animationDelay: `${140 + index * 150}ms` }}
        />
      ))}
      {completedConnectorPath ? (
        <ConnectorPath
          d={completedConnectorPath}
          fill="none"
          stroke={WORKFLOW_PAGE_COLORS.arrowStroke}
          strokeDasharray="4 3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        />
      ) : null}
      <PortsLayer>
        {nodes.map((node) => {
          const cx = node.x + node.width / 2;
          const bottomY = node.y + WORKFLOW_NODE_HEIGHT + 1;
          const rightX = node.x + node.width;
          const midY = node.y + WORKFLOW_NODE_HEIGHT / 2;

          return (
            <g key={`ports-${node.id}`}>
              {topPortNodeIds.has(node.id) ? (
                <circle
                  cx={cx}
                  cy={node.y}
                  fill={WORKFLOW_PAGE_COLORS.nodeSurface}
                  r="4"
                  stroke={WORKFLOW_PAGE_COLORS.nodeBorder}
                  strokeWidth="1"
                />
              ) : null}
              {bottomPortNodeIds.has(node.id) ? (
                <circle
                  cx={cx}
                  cy={bottomY}
                  fill={WORKFLOW_PAGE_COLORS.nodeSurface}
                  r="4"
                  stroke={WORKFLOW_PAGE_COLORS.nodeBorder}
                  strokeWidth="1"
                />
              ) : null}
              {rightPortNodeIds.has(node.id) ? (
                <circle
                  cx={rightX}
                  cy={midY}
                  fill={WORKFLOW_PAGE_COLORS.nodeSurface}
                  r="4"
                  stroke={WORKFLOW_PAGE_COLORS.nodeBorder}
                  strokeWidth="1"
                />
              ) : null}
            </g>
          );
        })}
      </PortsLayer>
    </CanvasOverlay>
  );
}
