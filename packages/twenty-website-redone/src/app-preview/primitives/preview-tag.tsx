import { styled } from '@linaria/react';

import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';
import { type CellSelectColor } from '../types';

const TagPill = styled.span<{ $background: string; $color: string }>`
  align-items: center;
  background: ${({ $background }) => $background};
  border-radius: ${APP_PREVIEW_THEME.border.radius.sm};
  color: ${({ $color }) => $color};
  display: inline-flex;
  font-family: ${APP_PREVIEW_THEME.font.family};
  font-size: ${APP_PREVIEW_THEME.font.sizePx.md}px;
  font-weight: ${APP_PREVIEW_THEME.font.weight.regular};
  height: 20px;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 0 ${APP_PREVIEW_THEME.spacingBasePx * 2}px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function PreviewTag({
  color,
  label,
}: {
  color?: CellSelectColor;
  label: string;
}) {
  const palette = APP_PREVIEW_TONES.tag[color ?? 'gray'];
  return (
    <TagPill $background={palette.background} $color={palette.color}>
      {label}
    </TagPill>
  );
}
