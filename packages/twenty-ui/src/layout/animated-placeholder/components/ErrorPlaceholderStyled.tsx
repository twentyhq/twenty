import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme';

// eslint-disable-next-line twenty/styled-components-prefixed-with-styled
export const AnimatedPlaceholderErrorContainer = styled.div`
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  justify-content: center;
  text-align: center;
`;

// eslint-disable-next-line twenty/styled-components-prefixed-with-styled
export const AnimatedPlaceholderErrorTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  justify-content: center;
  text-align: center;
  width: 100%;
`;

// eslint-disable-next-line twenty/styled-components-prefixed-with-styled
export const AnimatedPlaceholderErrorTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: ${themeCssVariables.text.lineHeight.lg};
`;

// eslint-disable-next-line twenty/styled-components-prefixed-with-styled
export const AnimatedPlaceholderErrorSubTitle = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: ${themeCssVariables.text.lineHeight.md};
  max-height: 2.4em;
  overflow: hidden;
`;
