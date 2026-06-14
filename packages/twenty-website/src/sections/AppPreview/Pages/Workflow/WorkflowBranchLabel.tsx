import { styled } from '@linaria/react';

import type { WorkflowBranchLabel as WorkflowBranchLabelDefinition } from './workflow-page-data';
import {
  WORKFLOW_PAGE_COLORS,
  WORKFLOW_PAGE_FONT,
} from './workflow-page-theme';

const BranchLabel = styled.div<{ $centered?: boolean }>`
  align-items: center;
  animation: workflowBranchLabelAppear 320ms ease both;
  animation-delay: 700ms;
  background: ${WORKFLOW_PAGE_COLORS.nodeSurface};
  border: 1px solid ${WORKFLOW_PAGE_COLORS.nodeBorder};
  border-radius: 4px;
  color: ${WORKFLOW_PAGE_COLORS.textLight};
  display: inline-flex;
  font-family: ${WORKFLOW_PAGE_FONT};
  font-size: 11px;
  font-weight: 600;
  height: 20px;
  justify-content: center;
  min-width: 20px;
  padding: 0 4px;
  position: absolute;
  transform: ${({ $centered }) =>
    $centered ? 'translate(-50%, -50%)' : 'none'};
  z-index: 2;

  @keyframes workflowBranchLabelAppear {
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

export function WorkflowBranchLabel({
  text,
  x,
  y,
}: WorkflowBranchLabelDefinition) {
  return (
    <BranchLabel $centered={text === 'completed'} style={{ left: x, top: y }}>
      {text}
    </BranchLabel>
  );
}
