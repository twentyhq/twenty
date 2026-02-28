import { styled } from '@linaria/react';
import { MAIN_COLOR_NAMES, themeVar, type ThemeColor } from '@ui/theme';

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
  background: ${({ color }) => themeVar.tag.background[color]};
  border-radius: ${themeVar.border.radius.pill};
  color: ${({ color }) => themeVar.tag.text[color]};
  display: inline-flex;
  font-size: ${themeVar.font.size.md};
  font-style: normal;
  font-weight: ${({ weight }) => themeVar.font.weight[weight]};
  gap: ${themeVar.spacing[1]};
  height: ${themeVar.spacing[5]};
  margin: 0;
  overflow: hidden;
  padding: 0
    ${({ isLoaderVisible }) =>
      isLoaderVisible ? themeVar.spacing[1] : themeVar.spacing[2]}
    0 ${themeVar.spacing[2]};

  &:before {
    background-color: ${({ color }) => themeVar.tag.text[color]};
    border-radius: ${themeVar.border.radius.rounded};
    content: '';
    display: block;
    flex-shrink: 0;
    height: ${themeVar.spacing[1]};
    width: ${themeVar.spacing[1]};
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
