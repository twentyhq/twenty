import { styled } from '@linaria/react';
import { theme } from '@ui/theme';
import { type ReactNode } from 'react';

const StyledErrorContainer = styled.div`
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[8]};
  justify-content: center;
  text-align: center;
`;

export const AnimatedPlaceholderErrorContainer = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  return (
    <StyledErrorContainer className={className}>
      {children}
    </StyledErrorContainer>
  );
};

const StyledErrorTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
  justify-content: center;
  text-align: center;
  width: 100%;
`;

export const AnimatedPlaceholderErrorTextContainer = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  return (
    <StyledErrorTextContainer className={className}>
      {children}
    </StyledErrorTextContainer>
  );
};

const StyledErrorTitle = styled.div`
  color: ${theme.font.color.primary};
  font-size: ${theme.font.size.xl};
  font-weight: ${theme.font.weight.semiBold};
  line-height: ${theme.text.lineHeight.lg};
`;

export const AnimatedPlaceholderErrorTitle = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  return <StyledErrorTitle className={className}>{children}</StyledErrorTitle>;
};

const StyledErrorSubTitle = styled.div`
  color: ${theme.font.color.tertiary};
  font-size: ${theme.font.size.xs};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.text.lineHeight.md};
  max-height: 2.4em;
  overflow: hidden;
`;

export const AnimatedPlaceholderErrorSubTitle = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  return (
    <StyledErrorSubTitle className={className}>{children}</StyledErrorSubTitle>
  );
};
