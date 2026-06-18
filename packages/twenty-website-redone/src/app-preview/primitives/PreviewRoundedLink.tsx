import { styled } from '@linaria/react';

import { THEME_LIGHT } from 'twenty-ui/theme';
import { previewFontSize } from '@/app-preview/preview-font-size';
import { APP_PREVIEW_CHROME } from '@/app-preview/app-preview-chrome';

const LinkPill = styled.span`
  align-items: center;
  background-color: ${THEME_LIGHT.background.transparent.lighter};
  border: 1px solid ${THEME_LIGHT.border.color.strong};
  border-radius: ${THEME_LIGHT.border.radius.pill};
  color: ${THEME_LIGHT.font.color.primary};
  display: inline-flex;
  font-family: ${THEME_LIGHT.font.family};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.regular};
  gap: ${APP_PREVIEW_CHROME.spacingBasePx}px;
  height: 20px;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 0 ${APP_PREVIEW_CHROME.spacingBasePx * 2}px;
  text-overflow: ellipsis;
  user-select: none;
  white-space: nowrap;
`;

export function PreviewRoundedLink({ label }: { label: string }) {
  return <LinkPill>{label}</LinkPill>;
}
