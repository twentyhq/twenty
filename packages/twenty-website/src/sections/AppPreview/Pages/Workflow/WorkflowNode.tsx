import { theme } from '@/theme';
import { styled } from '@linaria/react';

import type { WorkflowNodeDefinition } from './workflow-page-data';
import {
  WORKFLOW_NODE_HEIGHT,
  WORKFLOW_PAGE_COLORS,
  WORKFLOW_PAGE_FONT,
  WORKFLOW_PAGE_TABLER_STROKE,
} from './workflow-page-theme';

const Node = styled.div<{ $index: number }>`
  align-items: center;
  animation: workflowNodeAppear 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: ${({ $index }) => `${150 + $index * 120}ms`};
  background: ${WORKFLOW_PAGE_COLORS.nodeSurface};
  border: 1px solid ${WORKFLOW_PAGE_COLORS.nodeBorder};
  border-radius: 8px;
  box-sizing: border-box;
  display: flex;
  gap: 8px;
  height: ${WORKFLOW_NODE_HEIGHT}px;
  left: 0;
  padding: 8px;
  position: absolute;
  top: 0;
  z-index: 1;

  @keyframes workflowNodeAppear {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const NodeIconContainer = styled.div`
  align-items: center;
  background: ${WORKFLOW_PAGE_COLORS.nodeIconSurface};
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
  color: ${WORKFLOW_PAGE_COLORS.textTertiary};
  font-family: ${WORKFLOW_PAGE_FONT};
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
`;

const NodeTitle = styled.div`
  color: ${WORKFLOW_PAGE_COLORS.textPrimary};
  font-family: ${WORKFLOW_PAGE_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function WorkflowNode({
  Icon,
  iconColor,
  index = 0,
  label,
  title,
  width,
  x,
  y,
}: Omit<WorkflowNodeDefinition, 'id'> & { index?: number }) {
  return (
    <Node $index={index} style={{ left: x, top: y, width }}>
      <NodeIconContainer>
        <Icon
          aria-hidden
          color={iconColor}
          size={20}
          stroke={WORKFLOW_PAGE_TABLER_STROKE}
        />
      </NodeIconContainer>
      <NodeContent>
        <NodeLabel>{label}</NodeLabel>
        <NodeTitle>{title}</NodeTitle>
      </NodeContent>
    </Node>
  );
}
