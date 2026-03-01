import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme';

// eslint-disable-next-line twenty/styled-components-prefixed-with-styled
export const IllustrationIconWrapper = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border: 0.75px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  justify-content: center;
`;
