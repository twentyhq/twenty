import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

import { APP_FONT } from '../utils/home-visual-theme';

const HOME_VISUAL_PERSON_TONES: Record<
  string,
  { background: string; color: string }
> = {
  amber: { background: '#f6e6d7', color: '#7a4f2a' },
  blue: { background: '#dbeafe', color: '#1d4ed8' },
  gray: { background: '#e5e7eb', color: '#4b5563' },
  green: { background: '#dcfce7', color: '#15803d' },
  orange: { background: '#ffdcc3', color: '#ED5F00' },
  pink: { background: '#ffe4e6', color: '#be123c' },
  purple: { background: '#ede9fe', color: '#6d28d9' },
  red: { background: '#fee2e2', color: '#b91c1c' },
  teal: { background: '#ccfbf1', color: '#0f766e' },
};

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
  font-family: ${APP_FONT};
  font-size: 10px;
  font-weight: ${theme.font.weight.medium};
  height: ${({ $size }) => `${$size}px`};
  justify-content: center;
  line-height: 1;
  overflow: hidden;
  width: ${({ $size }) => `${$size}px`};
`;

export function HomeVisualAvatar({
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
    HOME_VISUAL_PERSON_TONES[tone] ?? HOME_VISUAL_PERSON_TONES.gray;

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
