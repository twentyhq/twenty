import { styled } from '@linaria/react';

const StyledErrorContainer = styled.div`
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  justify-content: center;
  text-align: center;
`;

export { StyledErrorContainer as AnimatedPlaceholderErrorContainer };

const StyledErrorTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  justify-content: center;
  text-align: center;
  width: 100%;
`;

export { StyledErrorTextContainer as AnimatedPlaceholderErrorTextContainer };

const StyledErrorTitle = styled.div`
  color: var(--font-color-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semi-bold);
  line-height: var(--text-line-height-lg);
`;

export { StyledErrorTitle as AnimatedPlaceholderErrorTitle };

const StyledErrorSubTitle = styled.div`
  color: var(--font-color-tertiary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-regular);
  line-height: var(--text-line-height-md);
  max-height: 2.4em;
  overflow: hidden;
`;

export { StyledErrorSubTitle as AnimatedPlaceholderErrorSubTitle };
