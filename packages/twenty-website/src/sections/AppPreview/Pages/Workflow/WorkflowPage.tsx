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
  workflowNodes as defaultNodes,
} from './workflow-page-data';
import {
  WORKFLOW_CANVAS_HEIGHT,
  WORKFLOW_CANVAS_TOP_OFFSET,
  WORKFLOW_CANVAS_WIDTH,
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

const Canvas = styled.div`
  background-color: ${WORKFLOW_PAGE_COLORS.canvasBackground};
  background-image: radial-gradient(
    circle,
    ${WORKFLOW_PAGE_COLORS.canvasDot} 1px,
    transparent 1.2px
  );
  background-position: 10px 10px;
  background-size: 20px 20px;
  box-sizing: border-box;
  height: ${WORKFLOW_CANVAS_HEIGHT + WORKFLOW_CANVAS_TOP_OFFSET}px;
  min-height: 100%;
  min-width: 100%;
  overflow: hidden;
  position: relative;
  width: ${WORKFLOW_CANVAS_WIDTH}px;
`;

const CanvasContent = styled.div`
  height: ${WORKFLOW_CANVAS_HEIGHT}px;
  left: calc((100% - ${WORKFLOW_CANVAS_WIDTH}px) / 2);
  position: absolute;
  top: ${WORKFLOW_CANVAS_TOP_OFFSET}px;
  width: ${WORKFLOW_CANVAS_WIDTH}px;
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
`;

export function WorkflowPage({ page }: { page: WorkflowPageDefinition }) {
  const hasCustomNodes = Boolean(page.nodes);
  const nodes = hasCustomNodes
    ? resolveWorkflowNodes(page.nodes!)
    : defaultNodes;
  const edges = page.edges ?? (hasCustomNodes ? [] : defaultEdges);
  const branchLabels =
    page.branchLabels ?? (hasCustomNodes ? [] : defaultBranchLabels);

  return (
    <PageShell>
      <CanvasViewportShell>
        <ActiveBadge>
          <ActiveBadgeLabel>Active</ActiveBadgeLabel>
        </ActiveBadge>
        <CanvasViewport
          aria-label={`Interactive preview of the ${page.header.title.toLowerCase()} workflow`}
        >
          <Canvas>
            <CanvasContent>
              <WorkflowEdges
                edges={edges}
                nodes={nodes}
                plusNode={page.plusNode}
              />

              {nodes.map((node, index) => (
                <WorkflowNode
                  key={`${node.title}-${node.x}-${node.y}`}
                  Icon={node.Icon}
                  iconColor={node.iconColor}
                  index={index}
                  label={node.label}
                  title={node.title}
                  width={node.width}
                  x={node.x}
                  y={node.y}
                />
              ))}

              {branchLabels.map((label) => (
                <WorkflowBranchLabel
                  key={`${label.text}-${label.x}-${label.y}`}
                  text={label.text}
                  x={label.x}
                  y={label.y}
                />
              ))}

              {page.plusNode && (
                <PlusNodeSquare
                  style={{
                    left: page.plusNode.x - PLUS_NODE_SIZE / 2,
                    top: page.plusNode.y - PLUS_NODE_SIZE / 2,
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
