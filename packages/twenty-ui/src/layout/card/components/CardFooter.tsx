import { css } from '@emotion/react';
import styled from '@emotion/styled';

const StyledCardFooter = styled.div<{ divider?: boolean }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-top: ${({ divider = true, theme }) =>
    divider ? css`1px solid ${theme.border.color.medium}` : 0};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(2, 4)};
`;

export { StyledCardFooter as CardFooter };
