import { styled } from '@linaria/react';

import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

import { WORKFLOW_GRAPH } from './workflow-data';
import { WorkflowBranchLabel } from './workflow-branch-label';
import { WorkflowEdges } from './workflow-edges';
import { WorkflowNode } from './workflow-node';
import { WORKFLOW_THEME } from './workflow-theme';
import { type WorkflowPageDefinition } from '../../types';

const theme = APP_PREVIEW_THEME;
const colors = WORKFLOW_THEME.colors;

const PageShell = styled.div`
  background: ${colors.canvasBackground};
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 100%;
  min-width: 100%;
`;

const CanvasViewportShell = styled.div`
  background: ${colors.canvasBackground};
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
  background-color: ${colors.canvasBackground};
  background-image: radial-gradient(
    circle,
    ${colors.canvasDot} 1px,
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
  top: ${WORKFLOW_THEME.canvasTopOffsetPx}px;
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
  background: ${colors.activeBadgeBackground};
  border-radius: 4px;
  color: ${colors.activeBadgeText};
  display: inline-flex;
  font-family: ${theme.font.family};
  font-size: ${theme.font.sizePx.md}px;
  font-weight: ${theme.font.weight.regular};
  height: 20px;
  line-height: 1.4;
  padding: 0 8px;
`;

// The named workflows render the authored default graph. The custom-graph
// normalization path (AI-created workflows, plus-node connector) arrives
// with the scenario in commit 7.
export function WorkflowPage({ page }: { page: WorkflowPageDefinition }) {
  const nodes = page.nodes ?? WORKFLOW_GRAPH.nodes;
  const edges = page.edges ?? (page.nodes ? [] : WORKFLOW_GRAPH.edges);
  const branchLabels =
    page.branchLabels ?? (page.nodes ? [] : WORKFLOW_GRAPH.branchLabels);

  return (
    <PageShell>
      <CanvasViewportShell>
        <ActiveBadge>
          <ActiveBadgeLabel>Active</ActiveBadgeLabel>
        </ActiveBadge>
        <CanvasViewport
          aria-label={`Interactive preview of the ${page.header.title.toLowerCase()} workflow`}
        >
          <Canvas
            $height={WORKFLOW_THEME.canvasHeightPx}
            $width={WORKFLOW_THEME.canvasWidthPx}
          >
            <CanvasContent
              $height={WORKFLOW_THEME.canvasHeightPx}
              $width={WORKFLOW_THEME.canvasWidthPx}
              data-workflow-canvas
            >
              <WorkflowEdges
                canvasHeight={WORKFLOW_THEME.canvasHeightPx}
                canvasWidth={WORKFLOW_THEME.canvasWidthPx}
                edges={edges}
                nodes={nodes}
              />
              {nodes.map((node, index) => (
                <WorkflowNode index={index} key={node.id} node={node} />
              ))}
              {branchLabels.map((label) => (
                <WorkflowBranchLabel
                  key={`${label.text}-${label.x}`}
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
