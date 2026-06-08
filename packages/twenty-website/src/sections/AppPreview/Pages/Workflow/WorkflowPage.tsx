'use client';

import { styled } from '@linaria/react';

import { theme } from '@/theme';

import type { WorkflowPageDefinition } from '../../types';
import { resolveWorkflowNodes } from './resolve-workflow-nodes';
import { WorkflowBranchLabel } from './WorkflowBranchLabel';
import { WorkflowEdges } from './WorkflowEdges';
import { WorkflowNode } from './WorkflowNode';
import {
  workflowBranchLabels as defaultBranchLabels,
  workflowEdges as defaultEdges,
  type WorkflowBranchLabel as WorkflowBranchLabelDefinition,
  type WorkflowEdgeDefinition,
  type WorkflowNodeDefinition,
  workflowNodes as defaultNodes,
} from './workflow-page-data';
import {
  WORKFLOW_CANVAS_HEIGHT,
  WORKFLOW_CANVAS_TOP_OFFSET,
  WORKFLOW_CANVAS_WIDTH,
  WORKFLOW_NODE_HEIGHT,
  WORKFLOW_PAGE_COLORS,
  WORKFLOW_PAGE_FONT,
} from './workflow-page-theme';

const PageShell = styled.div`
  background: ${WORKFLOW_PAGE_COLORS.canvasBackground};
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 100%;
  min-width: 100%;
`;

const CanvasViewportShell = styled.div`
  background: ${WORKFLOW_PAGE_COLORS.canvasBackground};
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  position: relative;
`;

const CanvasViewport = styled.div`
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow: auto;
`;

const Canvas = styled.div<{ $height: number; $width: number }>`
  background-color: ${WORKFLOW_PAGE_COLORS.canvasBackground};
  background-image: radial-gradient(
    circle,
    ${WORKFLOW_PAGE_COLORS.canvasDot} 1px,
    transparent 1.2px
  );
  background-position: 10px 10px;
  background-size: 20px 20px;
  box-sizing: border-box;
  height: ${({ $height }) => `${$height}px`};
  min-height: 100%;
  min-width: 100%;
  overflow: hidden;
  position: relative;
  width: ${({ $width }) => `${$width}px`};
`;

const CanvasContent = styled.div<{ $height: number; $width: number }>`
  height: ${({ $height }) => `${$height}px`};
  left: calc((100% - ${({ $width }) => `${$width}px`}) / 2);
  position: absolute;
  top: ${WORKFLOW_CANVAS_TOP_OFFSET}px;
  width: ${({ $width }) => `${$width}px`};
`;

const ActiveBadge = styled.div`
  left: 8px;
  pointer-events: none;
  position: absolute;
  top: 8px;
  z-index: 3;
`;

const ActiveBadgeLabel = styled.span`
  align-items: center;
  background: ${WORKFLOW_PAGE_COLORS.activeBadgeBackground};
  border-radius: 4px;
  color: ${WORKFLOW_PAGE_COLORS.activeBadgeText};
  display: inline-flex;
  font-family: ${WORKFLOW_PAGE_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  height: 20px;
  line-height: 1.4;
  padding: 0 8px;
`;

const PLUS_NODE_SIZE = 24;

const PlusNodeSquare = styled.div`
  align-items: center;
  animation: workflowPlusAppear 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: 820ms;
  background: ${WORKFLOW_PAGE_COLORS.nodeSurface};
  border: 1px solid ${WORKFLOW_PAGE_COLORS.nodeBorder};
  border-radius: 4px;
  color: ${WORKFLOW_PAGE_COLORS.textTertiary};
  display: flex;
  font-size: 16px;
  font-weight: 300;
  height: ${PLUS_NODE_SIZE}px;
  justify-content: center;
  position: absolute;
  width: ${PLUS_NODE_SIZE}px;

  @keyframes workflowPlusAppear {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

type WorkflowLayout = {
  branchLabels: ReadonlyArray<WorkflowBranchLabelDefinition>;
  canvasHeight: number;
  canvasWidth: number;
  contentHeight: number;
  contentWidth: number;
  nodes: ReadonlyArray<WorkflowNodeDefinition>;
  plusNode?: { x: number; y: number };
};

function getDefaultWorkflowLayout(
  nodes: ReadonlyArray<WorkflowNodeDefinition>,
  branchLabels: ReadonlyArray<WorkflowBranchLabelDefinition>,
  plusNode?: { x: number; y: number },
): WorkflowLayout {
  return {
    branchLabels,
    canvasHeight: WORKFLOW_CANVAS_HEIGHT + WORKFLOW_CANVAS_TOP_OFFSET,
    canvasWidth: WORKFLOW_CANVAS_WIDTH,
    contentHeight: WORKFLOW_CANVAS_HEIGHT,
    contentWidth: WORKFLOW_CANVAS_WIDTH,
    nodes,
    plusNode,
  };
}

function getCustomWorkflowLayout(
  nodes: ReadonlyArray<WorkflowNodeDefinition>,
  edges: ReadonlyArray<WorkflowEdgeDefinition>,
  branchLabels: ReadonlyArray<WorkflowBranchLabelDefinition>,
  plusNode?: { x: number; y: number },
): WorkflowLayout {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const labelWidthEstimate = 44;
  const labelHeightEstimate = 20;

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const node of nodes) {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x + node.width);
    minY = Math.min(minY, node.y);
    maxY = Math.max(maxY, node.y + WORKFLOW_NODE_HEIGHT);
  }

  for (const label of branchLabels) {
    minX = Math.min(minX, label.x);
    maxX = Math.max(maxX, label.x + labelWidthEstimate);
    minY = Math.min(minY, label.y);
    maxY = Math.max(maxY, label.y + labelHeightEstimate);
  }

  if (plusNode) {
    minX = Math.min(minX, plusNode.x - PLUS_NODE_SIZE / 2);
    maxX = Math.max(maxX, plusNode.x + PLUS_NODE_SIZE / 2);
    minY = Math.min(minY, plusNode.y - PLUS_NODE_SIZE / 2);
    maxY = Math.max(maxY, plusNode.y + PLUS_NODE_SIZE / 2);
  }

  for (const edge of edges) {
    if (edge.type !== 'loopBack') {
      continue;
    }

    const fromNode = nodeById.get(edge.from);
    const toNode = nodeById.get(edge.to);

    if (!fromNode || !toNode) {
      continue;
    }

    const rightExtent = fromNode.x + fromNode.width + 40;
    const bottomExtent = fromNode.y + WORKFLOW_NODE_HEIGHT + 1 + 180;
    const returnExtent = toNode.y + WORKFLOW_NODE_HEIGHT + 50;

    maxX = Math.max(maxX, rightExtent);
    maxY = Math.max(maxY, bottomExtent, returnExtent);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
    return getDefaultWorkflowLayout(nodes, branchLabels, plusNode);
  }

  const paddingX = 72;
  const paddingTop = 20;
  const paddingBottom = 56;
  const offsetX = paddingX - minX;
  const offsetY = paddingTop - minY;
  const contentWidth = Math.ceil(maxX - minX + paddingX * 2);
  const contentHeight = Math.ceil(maxY - minY + paddingTop + paddingBottom);

  return {
    branchLabels: branchLabels.map((label) => ({
      ...label,
      x: label.x + offsetX,
      y: label.y + offsetY,
    })),
    canvasHeight: contentHeight + WORKFLOW_CANVAS_TOP_OFFSET,
    canvasWidth: contentWidth,
    contentHeight,
    contentWidth,
    nodes: nodes.map((node) => ({
      ...node,
      x: node.x + offsetX,
      y: node.y + offsetY,
    })),
    plusNode: plusNode
      ? {
          x: plusNode.x + offsetX,
          y: plusNode.y + offsetY,
        }
      : undefined,
  };
}

export function WorkflowPage({ page }: { page: WorkflowPageDefinition }) {
  const hasCustomNodes = Boolean(page.nodes);
  const nodes = hasCustomNodes
    ? resolveWorkflowNodes(page.nodes!)
    : defaultNodes;
  const edges = page.edges ?? (hasCustomNodes ? [] : defaultEdges);
  const branchLabels =
    page.branchLabels ?? (hasCustomNodes ? [] : defaultBranchLabels);
  const layout = hasCustomNodes
    ? getCustomWorkflowLayout(nodes, edges, branchLabels, page.plusNode)
    : getDefaultWorkflowLayout(nodes, branchLabels, page.plusNode);

  return (
    <PageShell>
      <CanvasViewportShell>
        <ActiveBadge>
          <ActiveBadgeLabel>Active</ActiveBadgeLabel>
        </ActiveBadge>
        <CanvasViewport
          aria-label={`Interactive preview of the ${page.header.title.toLowerCase()} workflow`}
        >
          <Canvas $height={layout.canvasHeight} $width={layout.canvasWidth}>
            <CanvasContent
              $height={layout.contentHeight}
              $width={layout.contentWidth}
              data-workflow-canvas
            >
              {!page.generating && (
                <WorkflowEdges
                  canvasHeight={layout.contentHeight}
                  canvasWidth={layout.contentWidth}
                  edges={edges}
                  nodes={layout.nodes}
                  plusNode={layout.plusNode}
                />
              )}

              {layout.nodes.map((node, index) => (
                <WorkflowNode
                  key={`${node.title}-${node.x}-${node.y}`}
                  Icon={node.Icon}
                  generating={page.generating}
                  iconColor={node.iconColor}
                  index={index}
                  label={node.label}
                  title={node.title}
                  width={node.width}
                  x={node.x}
                  y={node.y}
                />
              ))}

              {!page.generating &&
                layout.branchLabels.map((label) => (
                  <WorkflowBranchLabel
                    key={`${label.text}-${label.x}-${label.y}`}
                    text={label.text}
                    x={label.x}
                    y={label.y}
                  />
                ))}

              {!page.generating && layout.plusNode && (
                <PlusNodeSquare
                  style={{
                    left: layout.plusNode.x - PLUS_NODE_SIZE / 2,
                    top: layout.plusNode.y - PLUS_NODE_SIZE / 2,
                  }}
                >
                  +
                </PlusNodeSquare>
              )}
            </CanvasContent>
          </Canvas>
        </CanvasViewport>
      </CanvasViewportShell>
    </PageShell>
  );
}
