import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

const AvatarFrame = styled.div<{
  $background: string;
  $color: string;
  $size: number;
}>`
  align-items: center;
  background: ${({ $background }) => $background};
  border-radius: 50%;
  color: ${({ $color }) => $color};
  display: flex;
  flex: 0 0 auto;
  font-family: ${THEME_LIGHT.font.family};
  font-size: ${({ $size }) =>
    $size <= 12 ? '8px' : $size <= 14 ? '10px' : '12px'};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  height: ${({ $size }) => `${$size}px`};
  justify-content: center;
  line-height: 1;
  overflow: hidden;
  width: ${({ $size }) => `${$size}px`};

  &[data-square] {
    border-radius: ${THEME_LIGHT.border.radius.xs};
  }
`;

export function PreviewAvatar({
  children,
  size = 14,
  square = false,
  tone = 'gray',
}: {
  children: ReactNode;
  size?: number;
  square?: boolean;
  tone?: string;
}) {
  const resolvedTone =
    APP_PREVIEW_TONES.person[tone] ?? APP_PREVIEW_TONES.person.gray;
  return (
    <AvatarFrame
      $background={resolvedTone.background}
      $color={resolvedTone.color}
      $size={size}
      data-square={square ? '' : undefined}
    >
      {children}
    </AvatarFrame>
  );
}
