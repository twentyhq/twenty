import { styled } from '@linaria/react';

import { REDUCED_MOTION } from '@/tokens';
import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

import { WORKFLOW_THEME } from './workflow-theme';
import { type WorkflowBranchLabelDef } from '../../types';

const colors = WORKFLOW_THEME.colors;

const BranchLabelPill = styled.div<{ $centered?: boolean }>`
  align-items: center;
  animation: workflowBranchLabelAppear 320ms ease both;
  animation-delay: 700ms;
  background: ${colors.nodeSurface};
  border: 1px solid ${colors.nodeBorder};
  border-radius: 4px;
  color: ${colors.textLight};
  display: inline-flex;
  font-family: ${APP_PREVIEW_THEME.font.family};
  font-size: 11px;
  font-weight: ${APP_PREVIEW_THEME.font.weight.semiBold};
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

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

export function WorkflowBranchLabel({ text, x, y }: WorkflowBranchLabelDef) {
  return (
    <BranchLabelPill
      $centered={text === 'completed'}
      style={{ left: x, top: y }}
    >
      {text}
    </BranchLabelPill>
  );
}
