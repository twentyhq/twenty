import { styled } from '@linaria/react';
import { themeVar } from '@ui/theme';
import { type ReactNode } from 'react';

const StyledErrorContainer = styled.div`
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${themeVar.spacing[8]};
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
  gap: ${themeVar.spacing[4]};
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
  color: ${themeVar.font.color.primary};
  font-size: ${themeVar.font.size.xl};
  font-weight: ${themeVar.font.weight.semiBold};
  line-height: ${themeVar.text.lineHeight.lg};
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
  color: ${themeVar.font.color.tertiary};
  font-size: ${themeVar.font.size.xs};
  font-weight: ${themeVar.font.weight.regular};
  line-height: ${themeVar.text.lineHeight.md};
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
