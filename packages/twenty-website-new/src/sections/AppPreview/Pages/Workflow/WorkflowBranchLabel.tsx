import { theme } from '@/theme';
import { styled } from '@linaria/react';

import type { WorkflowBranchLabel as WorkflowBranchLabelDefinition } from './workflow-page-data';
import {
  WORKFLOW_PAGE_COLORS,
  WORKFLOW_PAGE_FONT,
} from './workflow-page-theme';

const BranchLabel = styled.div`
  align-items: center;
  background: ${WORKFLOW_PAGE_COLORS.nodeSurface};
  border: 1px solid ${WORKFLOW_PAGE_COLORS.nodeBorder};
  border-radius: 6px;
  color: ${WORKFLOW_PAGE_COLORS.textTertiary};
  display: inline-flex;
  font-family: ${WORKFLOW_PAGE_FONT};
  font-size: 11px;
  font-weight: ${theme.font.weight.medium};
  height: 22px;
  justify-content: center;
  min-width: 24px;
  padding: 0 6px;
  position: absolute;
  z-index: 2;
`;

export function WorkflowBranchLabel({
  text,
  x,
  y,
}: WorkflowBranchLabelDefinition) {
  return <BranchLabel style={{ left: x, top: y }}>{text}</BranchLabel>;
}
