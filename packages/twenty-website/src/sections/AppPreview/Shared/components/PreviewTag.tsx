import { styled } from '@linaria/react';

import { VISUAL_TOKENS } from '../utils/app-preview-tokens';

type PreviewTagColor =
  | 'amber'
  | 'blue'
  | 'gray'
  | 'green'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal';

const TAG_COLORS: Record<
  PreviewTagColor,
  { background: string; color: string }
> = {
  amber: { background: '#FEF2A4', color: '#35290F' },
  blue: { background: '#d9e2fc', color: '#3a5ccc' },
  gray: { background: '#fafafa', color: '#666666' },
  green: { background: '#ccebd7', color: '#299764' },
  orange: { background: '#ffdcc3', color: '#ed5f00' },
  pink: { background: '#fcdced', color: '#d6409f' },
  purple: { background: '#eddbf9', color: '#8347b9' },
  red: { background: '#fdd8d8', color: '#dc3d43' },
  teal: { background: '#c7ebe5', color: '#0E9888' },
};

const TagPill = styled.span<{
  $background: string;
  $color: string;
}>`
  align-items: center;
  background: ${({ $background }) => $background};
  border-radius: ${VISUAL_TOKENS.border.radius.sm};
  color: ${({ $color }) => $color};
  display: inline-flex;
  font-family: ${VISUAL_TOKENS.font.family};
  font-size: ${VISUAL_TOKENS.font.size.md};
  font-weight: ${VISUAL_TOKENS.font.weight.regular};
  height: 20px;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 0 ${VISUAL_TOKENS.spacing[2]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function PreviewTag({
  color,
  label,
}: {
  color?: PreviewTagColor;
  label: string;
}) {
  const resolvedColor = color ?? 'gray';
  const palette = TAG_COLORS[resolvedColor];

  return (
    <TagPill $background={palette.background} $color={palette.color}>
      {label}
    </TagPill>
  );
}
