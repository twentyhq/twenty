import { styled } from '@linaria/react';
import { useContext } from 'react';

import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { OverflowingTextWithTooltip } from '@ui/display/tooltip/OverflowingTextWithTooltip';
import { type ThemeColor, ThemeContext, themeVar } from '@ui/theme';
import { isDefined } from 'twenty-shared/utils';

const StyledTag = styled.h3<{
  color: TagColor;
  weight: TagWeight;
  variant: TagVariant;
  preventShrink?: boolean;
  preventPadding?: boolean;
}>`
  align-items: center;
  background: ${({ color }) => {
    if (color === 'transparent') {
      return 'transparent';
    } else {
      return `var(--t-tag-background-${color}, ${themeVar.tag.background.gray})`;
    }
  }};
  border-radius: ${themeVar.border.radius.sm};
  color: ${({ color }) =>
    color === 'transparent'
      ? themeVar.font.color.secondary
      : `var(--t-tag-text-${color})`};
  display: inline-flex;
  font-size: ${themeVar.font.size.md};
  font-style: normal;
  font-weight: ${({ weight }) =>
    weight === 'regular'
      ? themeVar.font.weight.regular
      : themeVar.font.weight.medium};
  height: ${themeVar.spacing[5]};
  margin: 0;
  overflow: hidden;
  padding: ${({ preventPadding }) =>
    preventPadding ? '0' : `0 ${themeVar.spacing[2]}`};
  border: ${({ variant }) =>
    variant === 'outline' || variant === 'border'
      ? `1px ${variant === 'border' ? 'solid' : 'dashed'} ${themeVar.border.color.strong}`
      : 'none'};

  gap: ${themeVar.spacing[1]};

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
