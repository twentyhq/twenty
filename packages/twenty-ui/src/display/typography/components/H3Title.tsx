import { styled } from '@linaria/react';
import { OverflowingTextWithTooltip } from '@ui/display/tooltip/OverflowingTextWithTooltip';
import { type ReactNode } from 'react';

type H3TitleProps = {
  title: ReactNode;
  description?: string;
  className?: string;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledH3Title = styled.h3`
  color: var(--font-color-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semi-bold);
  margin: 0;
`;

const StyledDescription = styled.h4`
  color: var(--font-color-tertiary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-regular);
  margin: 0;
  margin-top: var(--spacing-2);
`;

export const H3Title = ({ title, description, className }: H3TitleProps) => {
  return (
    <StyledContainer className={className}>
      <StyledH3Title>{title}</StyledH3Title>
      {description && (
        // Design rule: Never set a description for H3 if there are any H2 in the page
        // (in that case, each H2 must have its own description)
        <StyledDescription>
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
