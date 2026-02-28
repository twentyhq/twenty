import { styled } from '@linaria/react';
import { theme } from '@ui/theme';

// eslint-disable-next-line twenty/styled-components-prefixed-with-styled
export const AnimatedPlaceholderErrorContainer = styled.div`
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[8]};
  justify-content: center;
  text-align: center;
`;

// eslint-disable-next-line twenty/styled-components-prefixed-with-styled
export const AnimatedPlaceholderErrorTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
  justify-content: center;
  text-align: center;
  width: 100%;
`;

// eslint-disable-next-line twenty/styled-components-prefixed-with-styled
export const AnimatedPlaceholderErrorTitle = styled.div`
  color: ${theme.font.color.primary};
  font-size: ${theme.font.size.xl};
  font-weight: ${theme.font.weight.semiBold};
  line-height: ${theme.text.lineHeight.lg};
`;

// eslint-disable-next-line twenty/styled-components-prefixed-with-styled
export const AnimatedPlaceholderErrorSubTitle = styled.div`
  color: ${theme.font.color.tertiary};
  font-size: ${theme.font.size.xs};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.text.lineHeight.md};
  max-height: 2.4em;
  overflow: hidden;
`;
