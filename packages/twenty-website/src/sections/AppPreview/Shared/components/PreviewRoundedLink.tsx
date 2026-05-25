import { styled } from '@linaria/react';

import { VISUAL_TOKENS } from '../utils/app-preview-tokens';

const LinkPill = styled.span`
  align-items: center;
  background-color: ${VISUAL_TOKENS.background.transparent.lighter};
  border: 1px solid ${VISUAL_TOKENS.border.color.strong};
  border-radius: ${VISUAL_TOKENS.border.radius.pill};
  color: ${VISUAL_TOKENS.font.color.primary};
  display: inline-flex;
  font-family: ${VISUAL_TOKENS.font.family};
  font-size: ${VISUAL_TOKENS.font.size.md};
  font-weight: ${VISUAL_TOKENS.font.weight.regular};
  gap: ${VISUAL_TOKENS.spacing[1]};
  height: 20px;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 0 ${VISUAL_TOKENS.spacing[2]};
  text-overflow: ellipsis;
  user-select: none;
  white-space: nowrap;
`;

export function PreviewRoundedLink({ label }: { label: string }) {
  return <LinkPill>{label}</LinkPill>;
}
