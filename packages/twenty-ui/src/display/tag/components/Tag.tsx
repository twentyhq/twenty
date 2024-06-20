import { useContext } from 'react';
import { styled } from '@linaria/react';

import { IconComponent, OverflowingTextWithTooltip } from '@ui/display';
import {
  BORDER_COMMON,
  THEME_COMMON,
  ThemeColor,
  ThemeContext,
  ThemeType,
} from '@ui/theme';

const spacing5 = THEME_COMMON.spacing(5);
const spacing2 = THEME_COMMON.spacing(2);
const spacing1 = THEME_COMMON.spacing(1);

const StyledTag = styled.h3<{
  theme: ThemeType;
  color: ThemeColor;
  weight: TagWeight;
  preventShrink?: boolean;
}>`
  align-items: center;
  background: ${({ color, theme }) => theme.tag.background[color]};
  border-radius: ${BORDER_COMMON.radius.sm};
  color: ${({ color, theme }) => theme.tag.text[color]};
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
  padding: 0 ${spacing2};

  gap: ${spacing1};

  min-width: ${({ preventShrink }) =>
    preventShrink ? 'fit-content' : 'none;'};
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

type TagProps = {
  className?: string;
  color: ThemeColor;
  text: string;
  Icon?: IconComponent;
  onClick?: () => void;
  weight?: TagWeight;
  preventShrink?: boolean;
};

// TODO: Find a way to have ellipsis and shrinkable tag in tag list while keeping good perf for table cells
export const Tag = ({
  className,
  color,
  text,
  Icon,
  onClick,
  weight = 'regular',
  preventShrink,
}: TagProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledTag
      theme={theme}
      className={className}
      color={color}
      onClick={onClick}
      weight={weight}
      preventShrink={preventShrink}
    >
      {!!Icon && (
        <StyledIconContainer>
          <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
        </StyledIconContainer>
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
