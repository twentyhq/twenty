import styled from '@emotion/styled';

export const StyledIconContainer = styled.div`
  align-items: flex-start;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(1)};
`;

export { StyledIconContainer as MenuItemIconBoxContainer };
