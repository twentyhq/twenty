'use client';

import { styled } from '@linaria/react';
import { useId } from 'react';

import { EASING, REDUCED_MOTION } from '@/tokens';

import {
  getWorkflowEdgePath,
  type PositionedWorkflowNode,
} from './workflow-geometry';
import { WORKFLOW_THEME } from './workflow-theme';
import { type WorkflowEdgeDef } from '../../types';

const colors = WORKFLOW_THEME.colors;
const NODE_HEIGHT = WORKFLOW_THEME.nodeHeightPx;

const CanvasOverlay = styled.svg`
  inset: 0;
  overflow: visible;
  pointer-events: none;
  position: absolute;
`;

const EdgePath = styled.path`
  animation: workflowEdgeDraw 620ms ${EASING.standard} both;
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

  ${REDUCED_MOTION} {
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

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

export function WorkflowEdges({
  canvasHeight,
  canvasWidth,
  edges,
  nodes,
}: {
  canvasHeight: number;
  canvasWidth: number;
  edges: ReadonlyArray<WorkflowEdgeDef>;
  nodes: ReadonlyArray<PositionedWorkflowNode>;
}) {
  const arrowId = `workflow-arrow-${useId().replace(/:/g, '')}`;

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
            stroke={colors.arrowStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.1"
          />
        </marker>
      </defs>
      {edges.map((edge, index) => (
        <EdgePath
          d={getWorkflowEdgePath({ edge, nodes })}
          fill="none"
          key={`${edge.from}-${edge.to}-${edge.type}`}
          markerEnd={edge.type === 'loopBack' ? undefined : `url(#${arrowId})`}
          pathLength={1}
          stroke={colors.arrowStroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          style={{ animationDelay: `${140 + index * 150}ms` }}
        />
      ))}
      <PortsLayer>
        {nodes.map((node) => {
          const cx = node.x + node.width / 2;
          const bottomY = node.y + NODE_HEIGHT + 1;
          const rightX = node.x + node.width;
          const midY = node.y + NODE_HEIGHT / 2;
          return (
            <g key={`ports-${node.id}`}>
              {topPortNodeIds.has(node.id) ? (
                <circle
                  cx={cx}
                  cy={node.y}
                  fill={colors.nodeSurface}
                  r="4"
                  stroke={colors.nodeBorder}
                  strokeWidth="1"
                />
              ) : null}
              {bottomPortNodeIds.has(node.id) ? (
                <circle
                  cx={cx}
                  cy={bottomY}
                  fill={colors.nodeSurface}
                  r="4"
                  stroke={colors.nodeBorder}
                  strokeWidth="1"
                />
              ) : null}
              {rightPortNodeIds.has(node.id) ? (
                <circle
                  cx={rightX}
                  cy={midY}
                  fill={colors.nodeSurface}
                  r="4"
                  stroke={colors.nodeBorder}
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
