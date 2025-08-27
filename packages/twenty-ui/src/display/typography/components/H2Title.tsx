import { styled } from '@linaria/react';
import { OverflowingTextWithTooltip } from '@ui/display/tooltip/OverflowingTextWithTooltip';

type H2TitleProps = {
  title: string;
  description?: string;
  adornment?: React.ReactNode;
  className?: string;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-4);
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledTitle = styled.h2`
  color: var(--font-color-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semi-bold);
  margin: 0;
`;

const StyledDescription = styled.h3`
  color: var(--font-color-tertiary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-regular);
  margin: 0;
  margin-top: var(--spacing-2);
`;

export const H2Title = ({
  title,
  description,
  adornment,
  className,
}: H2TitleProps) => (
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
