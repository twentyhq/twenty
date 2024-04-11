'use client';

import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  max-width: 898px;
  padding: 40px;
  gap: 40px;
  @media (max-width: 809px) {
    width: 100%;
    padding: 40px 24px 40px 24px;
    gap: 24px;
  }
`;

export const ContentContainer = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return <Container>{children}</Container>;
};
