import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

const AvatarFrame = styled.div<{
  $background: string;
  $color: string;
  $size: number;
  $square?: boolean;
}>`
  align-items: center;
  background: ${({ $background }) => $background};
  border-radius: ${({ $square }) => ($square ? '4px' : '999px')};
  color: ${({ $color }) => $color};
  display: flex;
  flex: 0 0 auto;
  font-family: ${APP_PREVIEW_THEME.font.family};
  font-size: 10px;
  font-weight: ${APP_PREVIEW_THEME.font.weight.medium};
  height: ${({ $size }) => `${$size}px`};
  justify-content: center;
  line-height: 1;
  overflow: hidden;
  width: ${({ $size }) => `${$size}px`};
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
      $square={square}
    >
      {children}
    </AvatarFrame>
  );
}
