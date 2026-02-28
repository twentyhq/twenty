import { styled } from '@linaria/react';
import { OverflowingTextWithTooltip } from '@ui/display/tooltip/OverflowingTextWithTooltip';
import { theme } from '@ui/theme';

type H2TitleProps = {
  title: string;
  description?: string;
  adornment?: React.ReactNode;
  className?: string;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${theme.spacing[4]};
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledTitle = styled.h2`
  color: ${theme.font.color.primary};
  font-size: ${theme.font.size.md};
  font-weight: ${theme.font.weight.semiBold};
  margin: 0;
`;

const StyledDescription = styled.h3`
  color: ${theme.font.color.tertiary};
  font-size: ${theme.font.size.md};
  font-weight: ${theme.font.weight.regular};
  margin: 0;
  margin-top: ${theme.spacing[2]};
`;

export const H2Title = ({
  title,
  description,
  adornment,
  className,
}: H2TitleProps) => {
  return (
    <StyledContainer className={className}>
      <StyledTitleContainer>
        <StyledTitle>{title}</StyledTitle>
        {adornment}
      </StyledTitleContainer>
      {description && (
        <StyledDescription>
          <OverflowingTextWithTooltip
            text={description}
            displayedMaxRows={5}
            isTooltipMultiline={true}
          />
        </StyledDescription>
      )}
    </StyledContainer>
  );
};
