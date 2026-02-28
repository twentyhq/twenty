import { styled } from '@linaria/react';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { type ReactNode, useContext } from 'react';

const StyledErrorContainer = styled.div<{ theme: ThemeType }>`
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
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
  const { theme } = useContext(ThemeContext);
  return (
    <StyledErrorContainer theme={theme} className={className}>
      {children}
    </StyledErrorContainer>
  );
};

const StyledErrorTextContainer = styled.div<{ theme: ThemeType }>`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
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
  const { theme } = useContext(ThemeContext);
  return (
    <StyledErrorTextContainer theme={theme} className={className}>
      {children}
    </StyledErrorTextContainer>
  );
};

const StyledErrorTitle = styled.div<{ theme: ThemeType }>`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
`;

export const AnimatedPlaceholderErrorTitle = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledErrorTitle theme={theme} className={className}>
      {children}
    </StyledErrorTitle>
  );
};

const StyledErrorSubTitle = styled.div<{ theme: ThemeType }>`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
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
  const { theme } = useContext(ThemeContext);
  return (
    <StyledErrorSubTitle theme={theme} className={className}>
      {children}
    </StyledErrorSubTitle>
  );
};
