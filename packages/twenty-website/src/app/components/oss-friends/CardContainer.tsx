'use client';

import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: center;
  max-width: 1000px;
  margin: 0 auto;
`;

export const CardContainer = ({ children }: { children?: React.ReactNode }) => {
  return <Container>{children}</Container>;
};
