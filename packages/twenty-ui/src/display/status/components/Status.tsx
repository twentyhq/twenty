import { styled } from '@linaria/react';
import { MAIN_COLOR_NAMES, theme, type ThemeColor } from '@ui/theme';

import { Loader } from '@ui/feedback/loader/components/Loader';

const parseThemeColor = (color: string): ThemeColor =>
  (MAIN_COLOR_NAMES as string[]).includes(color)
    ? (color as ThemeColor)
    : 'gray';

const StyledStatus = styled.h3<{
  color: ThemeColor;
  weight: 'regular' | 'medium';
  isLoaderVisible: boolean;
}>`
  align-items: center;
  background: ${({ color }) => theme.tag.background[color]};
  border-radius: ${theme.border.radius.pill};
  color: ${({ color }) => theme.tag.text[color]};
  display: inline-flex;
  font-size: ${theme.font.size.md};
  font-style: normal;
  font-weight: ${({ weight }) => theme.font.weight[weight]};
  gap: ${theme.spacing[1]};
  height: ${theme.spacing[5]};
  margin: 0;
  overflow: hidden;
  padding: 0
    ${({ isLoaderVisible }) =>
      isLoaderVisible ? theme.spacing[1] : theme.spacing[2]}
    0 ${theme.spacing[2]};

  &:before {
    background-color: ${({ color }) => theme.tag.text[color]};
    border-radius: ${theme.border.radius.rounded};
    content: '';
    display: block;
    flex-shrink: 0;
    height: ${theme.spacing[1]};
    width: ${theme.spacing[1]};
  }
`;

const StyledContent = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type StatusProps = {
  className?: string;
  color: ThemeColor;
  isLoaderVisible?: boolean;
  text: string;
  onClick?: () => void;
  weight?: 'regular' | 'medium';
};

export const Status = ({
  className,
  color,
  isLoaderVisible = false,
  text,
  onClick,
  weight = 'regular',
}: StatusProps) => {
  return (
    <StyledStatus
      className={className}
      color={parseThemeColor(color)}
      onClick={onClick}
      weight={weight}
      isLoaderVisible={isLoaderVisible}
    >
      <StyledContent>{text}</StyledContent>
      {isLoaderVisible ? <Loader color={color} /> : null}
    </StyledStatus>
  );
};
