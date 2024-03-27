import styled from '@emotion/styled';

const StyledCardHeader = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(2, 4)};
`;

export { StyledCardHeader as CardHeader };
