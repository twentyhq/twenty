import { styled } from '@linaria/react';

import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

const LinkPill = styled.span`
  align-items: center;
  background-color: ${APP_PREVIEW_THEME.background.transparent.lighter};
  border: 1px solid ${APP_PREVIEW_THEME.border.color.strong};
  border-radius: ${APP_PREVIEW_THEME.border.radius.pill};
  color: ${APP_PREVIEW_THEME.font.color.primary};
  display: inline-flex;
  font-family: ${APP_PREVIEW_THEME.font.family};
  font-size: ${APP_PREVIEW_THEME.font.sizePx.md}px;
  font-weight: ${APP_PREVIEW_THEME.font.weight.regular};
  gap: ${APP_PREVIEW_THEME.spacingBasePx}px;
  height: 20px;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 0 ${APP_PREVIEW_THEME.spacingBasePx * 2}px;
  text-overflow: ellipsis;
  user-select: none;
  white-space: nowrap;
`;

export function PreviewRoundedLink({ label }: { label: string }) {
  return <LinkPill>{label}</LinkPill>;
}
