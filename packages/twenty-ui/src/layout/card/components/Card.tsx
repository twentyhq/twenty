import styled from '@emotion/styled';

const StyledCard = styled.div<{ fullWidth?: boolean; rounded?: boolean }>`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme, rounded }) =>
    rounded ? theme.border.radius.md : theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  overflow: hidden;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

export { StyledCard as Card };
