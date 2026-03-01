import { styled } from '@linaria/react';
import {
  MAIN_COLOR_NAMES,
  themeCssVariables,
  type ThemeColor,
} from '@ui/theme';

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
  background: ${({ color }) => themeCssVariables.tag.background[color]};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${({ color }) => themeCssVariables.tag.text[color]};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.md};
  font-style: normal;
  font-weight: ${({ weight }) => themeCssVariables.font.weight[weight]};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[5]};
  margin: 0;
  overflow: hidden;
  padding: 0
    ${({ isLoaderVisible }) =>
      isLoaderVisible
        ? themeCssVariables.spacing[1]
        : themeCssVariables.spacing[2]}
    0 ${themeCssVariables.spacing[2]};

  &:before {
    background-color: ${({ color }) => themeCssVariables.tag.text[color]};
    border-radius: ${themeCssVariables.border.radius.rounded};
    content: '';
    display: block;
    flex-shrink: 0;
    height: ${themeCssVariables.spacing[1]};
    width: ${themeCssVariables.spacing[1]};
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
