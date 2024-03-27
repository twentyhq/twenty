import styled from '@emotion/styled';

const StyledCardFooter = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(2, 4)};
`;

export { StyledCardFooter as CardFooter };
