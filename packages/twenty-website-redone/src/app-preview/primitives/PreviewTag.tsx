import { styled } from '@linaria/react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '../preview-font-size';
import { type CellSelectColor } from '../types';

const TagPill = styled.span<{ $background: string; $color: string }>`
  align-items: center;
  background: ${({ $background }) => $background};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  color: ${({ $color }) => $color};
  display: inline-flex;
  font-family: ${THEME_LIGHT.font.family};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.regular};
  height: ${THEME_LIGHT.spacing(5)};
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 0 ${THEME_LIGHT.spacing(2)};
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
  const tagColor = color ?? 'gray';
  return (
    <TagPill
      $background={THEME_LIGHT.tag.background[tagColor]}
      $color={THEME_LIGHT.tag.text[tagColor]}
    >
      {label}
    </TagPill>
  );
}
