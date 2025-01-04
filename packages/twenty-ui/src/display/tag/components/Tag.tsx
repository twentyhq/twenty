import { styled } from '@linaria/react';
import { useContext } from 'react';

import { IconComponent, OverflowingTextWithTooltip } from '@ui/display';
import {
  BORDER_COMMON,
  THEME_COMMON,
  ThemeColor,
  ThemeContext,
  ThemeType,
} from '@ui/theme';
import { isDefined } from '@ui/utilities';

const spacing5 = THEME_COMMON.spacing(5);
const spacing2 = THEME_COMMON.spacing(2);
const spacing1 = THEME_COMMON.spacing(1);

const StyledTag = styled.h3<{
  theme: ThemeType;
  color: TagColor;
  weight: TagWeight;
  variant: TagVariant;
  preventShrink?: boolean;
  preventPadding?: boolean;
}>`
  align-items: center;
  background: ${({ color, theme }) => {
    if (color === 'transparent') {
      return 'transparent';
    } else {
      const themeColor = theme.tag.background[color];

      if (!isDefined(themeColor)) {
        console.warn(`Tag color ${color} is not defined in the theme`);
        return theme.tag.background.gray;
      } else {
        return themeColor;
      }
    }
  }};
  border-radius: ${BORDER_COMMON.radius.sm};
  color: ${({ color, theme }) =>
    color === 'transparent'
      ? theme.font.color.secondary
      : theme.tag.text[color]};
  display: inline-flex;
  font-size: ${({ theme }) => theme.font.size.md};
  font-style: normal;
  font-weight: ${({ theme, weight }) =>
    weight === 'regular'
      ? theme.font.weight.regular
      : theme.font.weight.medium};
  height: ${spacing5};
  margin: 0;
  overflow: hidden;
  padding: ${({ preventPadding }) => (preventPadding ? '0' : `0 ${spacing2}`)};
  border: ${({ variant, theme }) =>
    variant === 'outline' || variant === 'border'
      ? `1px ${variant === 'border' ? 'solid' : 'dashed'} ${theme.border.color.strong}`
      : 'none'};

  gap: ${spacing1};

  min-width: ${({ preventShrink }) => (preventShrink ? 'fit-content' : 'none')};
`;

const StyledContent = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledNonShrinkableText = styled.span`
  white-space: nowrap;
  width: fit-content;
`;

const StyledIconContainer = styled.div`
  display: flex;
`;

type TagWeight = 'regular' | 'medium';
type TagVariant = 'solid' | 'outline' | 'border';
export type TagColor = ThemeColor | 'transparent';

type TagProps = {
  className?: string;
  color: TagColor;
  text: string;
  Icon?: IconComponent;
  onClick?: () => void;
  weight?: TagWeight;
  variant?: TagVariant;
  preventShrink?: boolean;
  preventPadding?: boolean;
};

// TODO: Find a way to have ellipsis and shrinkable tag in tag list while keeping good perf for table cells
export const Tag = ({
  className,
  color,
  text,
  Icon,
  onClick,
  weight = 'regular',
  variant = 'solid',
  preventShrink,
  preventPadding,
}: TagProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledTag
      theme={theme}
      className={className}
      color={color}
      onClick={onClick}
      weight={weight}
      variant={variant}
      preventShrink={preventShrink}
      preventPadding={preventPadding}
    >
      {isDefined(Icon) ? (
        <StyledIconContainer>
          <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
        </StyledIconContainer>
      ) : (
        <></>
      )}
      {preventShrink ? (
        <StyledNonShrinkableText>{text}</StyledNonShrinkableText>
      ) : (
        <StyledContent>
          <OverflowingTextWithTooltip text={text} />
        </StyledContent>
      )}
    </StyledTag>
  );
};
