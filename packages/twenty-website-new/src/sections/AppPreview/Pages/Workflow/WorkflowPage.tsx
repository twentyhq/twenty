'use client';

import type { WorkflowPageDefinition } from '../../types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

import { WorkflowBranchLabel } from './WorkflowBranchLabel';
import { WorkflowEdges } from './WorkflowEdges';
import { WorkflowNode } from './WorkflowNode';
import {
  workflowBranchLabels,
  workflowEdges,
  workflowNodes,
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

export function WorkflowPage({ page }: { page: WorkflowPageDefinition }) {
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
              <WorkflowEdges edges={workflowEdges} nodes={workflowNodes} />

              {workflowNodes.map((node) => (
                <WorkflowNode
                  key={`${node.title}-${node.x}-${node.y}`}
                  Icon={node.Icon}
                  iconColor={node.iconColor}
                  id={node.id}
                  label={node.label}
                  title={node.title}
                  width={node.width}
                  x={node.x}
                  y={node.y}
                />
              ))}

              {workflowBranchLabels.map((label) => (
                <WorkflowBranchLabel
                  key={`${label.text}-${label.x}-${label.y}`}
                  text={label.text}
                  x={label.x}
                  y={label.y}
                />
              ))}
            </CanvasContent>
          </Canvas>
        </CanvasViewport>
      </CanvasViewportShell>
    </PageShell>
  );
}
