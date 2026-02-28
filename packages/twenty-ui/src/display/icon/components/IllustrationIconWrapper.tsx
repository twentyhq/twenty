import { styled } from '@linaria/react';
import { theme } from '@ui/theme';

// eslint-disable-next-line twenty/styled-components-prefixed-with-styled
export const IllustrationIconWrapper = styled.div`
  background-color: ${theme.background.primary};
  border: 0.75px solid ${theme.border.color.medium};
  border-radius: ${theme.border.radius.sm};
  display: flex;
  justify-content: center;
`;
