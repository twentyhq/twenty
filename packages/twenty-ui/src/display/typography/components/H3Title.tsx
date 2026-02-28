import { type ReactNode, useContext } from 'react';
import { styled } from '@linaria/react';
import { OverflowingTextWithTooltip } from '@ui/display/tooltip/OverflowingTextWithTooltip';
import { ThemeContext, type ThemeType } from '@ui/theme';

type H3TitleProps = {
  title: ReactNode;
  description?: string;
  className?: string;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledH3Title = styled.h3<{ theme: ThemeType }>`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
`;

const StyledDescription = styled.h4<{ theme: ThemeType }>`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin: 0;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const H3Title = ({ title, description, className }: H3TitleProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer className={className}>
      <StyledH3Title theme={theme}>{title}</StyledH3Title>
      {description && (
        // Design rule: Never set a description for H3 if there are any H2 in the page
        // (in that case, each H2 must have its own description)
        <StyledDescription theme={theme}>
          <OverflowingTextWithTooltip
            text={description}
            displayedMaxRows={2}
            isTooltipMultiline={true}
          />
        </StyledDescription>
      )}
    </StyledContainer>
  );
};
