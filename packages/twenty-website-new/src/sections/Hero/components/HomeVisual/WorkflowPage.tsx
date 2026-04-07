'use client';

import type { HeroWorkflowPageDefinition } from '@/sections/Hero/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconCode,
  IconFilter,
  IconPlug,
  IconPlus,
  IconRepeat,
  IconSearch,
  IconSitemap,
} from '@tabler/icons-react';
import { VISUAL_TOKENS } from './homeVisualTokens';

const APP_FONT = VISUAL_TOKENS.font.family;
const TABLER_STROKE = 1.6;
const CANVAS_WIDTH = 1480;
const CANVAS_HEIGHT = 1260;
const NODE_HEIGHT = 48;
const CANVAS_TOP_OFFSET = 16;

type WorkflowNodeDefinition = {
  Icon: typeof IconPlug;
  id: string;
  iconColor: string;
  label: 'Trigger' | 'Action';
  title: string;
  width: number;
  x: number;
  y: number;
};

type WorkflowBranchLabel = {
  text: string;
  x: number;
  y: number;
};

type WorkflowEdgeDefinition = {
  from: string;
  to: string;
  type: 'branch' | 'curve' | 'vertical';
};

const workflowNodes: WorkflowNodeDefinition[] = [
  {
    id: 'trigger',
    x: 370,
    y: 80,
    width: 238,
    label: 'Trigger',
    title: 'Record is created or updated',
    Icon: IconPlug,
    iconColor: '#4A67F6',
  },
  {
    id: 'is-personal-email',
    x: 620,
    y: 210,
    width: 220,
    label: 'Action',
    title: 'Is this a personal email?',
    Icon: IconCode,
    iconColor: '#FF6B5F',
  },
  {
    id: 'if-business-email',
    x: 640,
    y: 340,
    width: 180,
    label: 'Action',
    title: 'If business email',
    Icon: IconFilter,
    iconColor: VISUAL_TOKENS.font.color.secondary,
  },
  {
    id: 'extract-domain',
    x: 620,
    y: 470,
    width: 220,
    label: 'Action',
    title: 'Extract domain from email',
    Icon: IconCode,
    iconColor: '#FF6B5F',
  },
  {
    id: 'search-company',
    x: 640,
    y: 600,
    width: 180,
    label: 'Action',
    title: 'Search Company',
    Icon: IconSearch,
    iconColor: VISUAL_TOKENS.font.color.secondary,
  },
  {
    id: 'find-exact-match',
    x: 610,
    y: 730,
    width: 240,
    label: 'Action',
    title: 'Find exact company match',
    Icon: IconCode,
    iconColor: '#FF6B5F',
  },
  {
    id: 'company-already-exists',
    x: 600,
    y: 860,
    width: 260,
    label: 'Action',
    title: 'If a company already exists',
    Icon: IconSitemap,
    iconColor: VISUAL_TOKENS.font.color.secondary,
  },
  {
    id: 'attach-existing-company',
    x: 370,
    y: 990,
    width: 240,
    label: 'Action',
    title: 'Attach person to existing company',
    Icon: IconRepeat,
    iconColor: VISUAL_TOKENS.font.color.secondary,
  },
  {
    id: 'create-company',
    x: 840,
    y: 990,
    width: 220,
    label: 'Action',
    title: 'Create a new company',
    Icon: IconPlus,
    iconColor: VISUAL_TOKENS.font.color.secondary,
  },
  {
    id: 'attach-created-company',
    x: 850,
    y: 1120,
    width: 240,
    label: 'Action',
    title: 'Attach person to this company',
    Icon: IconRepeat,
    iconColor: VISUAL_TOKENS.font.color.secondary,
  },
];

const workflowEdges: WorkflowEdgeDefinition[] = [
  {
    from: 'trigger',
    to: 'is-personal-email',
    type: 'curve',
  },
  {
    from: 'is-personal-email',
    to: 'if-business-email',
    type: 'vertical',
  },
  {
    from: 'if-business-email',
    to: 'extract-domain',
    type: 'vertical',
  },
  {
    from: 'extract-domain',
    to: 'search-company',
    type: 'vertical',
  },
  {
    from: 'search-company',
    to: 'find-exact-match',
    type: 'vertical',
  },
  {
    from: 'find-exact-match',
    to: 'company-already-exists',
    type: 'vertical',
  },
  {
    from: 'company-already-exists',
    to: 'attach-existing-company',
    type: 'branch',
  },
  {
    from: 'company-already-exists',
    to: 'create-company',
    type: 'branch',
  },
  {
    from: 'create-company',
    to: 'attach-created-company',
    type: 'vertical',
  },
];

const workflowBranchLabels: WorkflowBranchLabel[] = [
  { x: 566, y: 944, text: 'if' },
  { x: 820, y: 944, text: 'else' },
];

const PageShell = styled.div`
  background: #ffffff;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 100%;
  min-width: 100%;
`;

const CanvasViewportShell = styled.div`
  background: #ffffff;
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
  background-color: #ffffff;
  background-image: radial-gradient(circle, #ebebeb 1px, transparent 1.2px);
  background-position: 10px 10px;
  background-size: 20px 20px;
  box-sizing: border-box;
  height: ${CANVAS_HEIGHT + CANVAS_TOP_OFFSET}px;
  min-height: 100%;
  min-width: 100%;
  overflow: hidden;
  position: relative;
  width: ${CANVAS_WIDTH}px;
`;

const CanvasContent = styled.div`
  height: ${CANVAS_HEIGHT}px;
  left: calc((100% - ${CANVAS_WIDTH}px) / 2);
  position: absolute;
  top: ${CANVAS_TOP_OFFSET}px;
  width: ${CANVAS_WIDTH}px;
`;

const CanvasOverlay = styled.svg`
  inset: 0;
  overflow: visible;
  pointer-events: none;
  position: absolute;
`;

const ActiveBadge = styled.div`
  left: 8px;
  position: absolute;
  pointer-events: none;
  top: 8px;
  z-index: 3;
`;

const ActiveBadgeLabel = styled.span`
  align-items: center;
  background: #dff3e6;
  border-radius: 4px;
  color: #228b52;
  display: inline-flex;
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  height: 20px;
  line-height: 1.4;
  padding: 0 8px;
`;

const Node = styled.div`
  align-items: center;
  background: ${VISUAL_TOKENS.background.secondary};
  border: 1px solid ${VISUAL_TOKENS.border.color.strong};
  border-radius: 8px;
  box-sizing: border-box;
  display: flex;
  gap: 8px;
  height: ${NODE_HEIGHT}px;
  left: 0;
  padding: 8px;
  position: absolute;
  top: 0;
  z-index: 1;
`;

const NodeIconContainer = styled.div`
  align-items: center;
  background: ${VISUAL_TOKENS.background.transparent.light};
  border-radius: 4px;
  display: flex;
  flex: 0 0 auto;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const NodeContent = styled.div`
  align-items: stretch;
  align-self: stretch;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: space-between;
  max-width: 184px;
  min-width: 0;
  padding-bottom: 2px;
`;

const NodeLabel = styled.div`
  color: ${VISUAL_TOKENS.font.color.tertiary};
  font-family: ${APP_FONT};
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
`;

const NodeTitle = styled.div`
  color: ${VISUAL_TOKENS.font.color.primary};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BranchLabel = styled.div`
  align-items: center;
  background: ${VISUAL_TOKENS.background.secondary};
  border: 1px solid ${VISUAL_TOKENS.border.color.medium};
  border-radius: 6px;
  color: ${VISUAL_TOKENS.font.color.tertiary};
  display: inline-flex;
  font-family: ${APP_FONT};
  font-size: 11px;
  font-weight: ${theme.font.weight.medium};
  height: 22px;
  justify-content: center;
  min-width: 24px;
  padding: 0 6px;
  position: absolute;
  z-index: 2;
`;

function getNodeById(nodeId: string) {
  const node = workflowNodes.find((workflowNode) => workflowNode.id === nodeId);

  if (!node) {
    throw new Error(`Unknown workflow node: ${nodeId}`);
  }

  return node;
}

function getNodeTopCenter(node: WorkflowNodeDefinition) {
  return {
    x: node.x + node.width / 2,
    y: node.y,
  };
}

function getNodeBottomCenter(node: WorkflowNodeDefinition) {
  return {
    x: node.x + node.width / 2,
    y: node.y + NODE_HEIGHT + 1,
  };
}

function getWorkflowEdgePath(edge: WorkflowEdgeDefinition) {
  const fromNode = getNodeById(edge.from);
  const toNode = getNodeById(edge.to);
  const start = getNodeBottomCenter(fromNode);
  const end = getNodeTopCenter(toNode);

  if (edge.type === 'vertical') {
    return `M${start.x} ${start.y} L${end.x} ${end.y}`;
  }

  if (edge.type === 'curve') {
    const controlStartY = start.y + 28;
    const controlEndY = end.y - 28;

    return `M${start.x} ${start.y} C${start.x} ${controlStartY} ${end.x} ${controlEndY} ${end.x} ${end.y}`;
  }

  const controlStartY = start.y + 28;
  const controlEndY = end.y - 28;

  return `M${start.x} ${start.y} C${start.x} ${controlStartY} ${end.x} ${controlEndY} ${end.x} ${end.y}`;
}

function WorkflowNode({
  x,
  y,
  width,
  label,
  title,
  Icon,
  iconColor,
}: WorkflowNodeDefinition) {
  return (
    <Node style={{ left: x, top: y, width }}>
      <NodeIconContainer>
        <Icon aria-hidden color={iconColor} size={20} stroke={TABLER_STROKE} />
      </NodeIconContainer>
      <NodeContent>
        <NodeLabel>{label}</NodeLabel>
        <NodeTitle>{title}</NodeTitle>
      </NodeContent>
    </Node>
  );
}

export function WorkflowPage({ page }: { page: HeroWorkflowPageDefinition }) {
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
              <CanvasOverlay
                aria-hidden
                viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
              >
                <defs>
                  <marker
                    id="hero-workflow-arrow"
                    markerHeight="6"
                    markerWidth="6"
                    orient="auto"
                    refX="5"
                    refY="3"
                  >
                    <path
                      d="M0.75 0.75 L5 3 L0.75 5.25"
                      fill="none"
                      stroke="#d8d2cb"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.1"
                    />
                  </marker>
                </defs>
                {workflowEdges.map((edge) => (
                  <path
                    key={`${edge.from}-${edge.to}`}
                    d={getWorkflowEdgePath(edge)}
                    fill="none"
                    markerEnd="url(#hero-workflow-arrow)"
                    stroke="#d8d2cb"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                  />
                ))}
              </CanvasOverlay>

              {workflowNodes.map((node) => (
                <WorkflowNode
                  key={`${node.title}-${node.x}-${node.y}`}
                  {...node}
                />
              ))}

              {workflowBranchLabels.map((label) => (
                <BranchLabel
                  key={`${label.text}-${label.x}-${label.y}`}
                  style={{ left: label.x, top: label.y }}
                >
                  {label.text}
                </BranchLabel>
              ))}
            </CanvasContent>
          </Canvas>
        </CanvasViewport>
      </CanvasViewportShell>
    </PageShell>
  );
}
