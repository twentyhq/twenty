'use client';

import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  text-align: center;
  flex-direction: column;
  width: 100%;
  gap: 64px;
  @media (max-width: 809px) {
    width: 100%;
    padding: 0px 20px 40px 20px;
  }
`;

export const ContentContainer = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return <Container>{children}</Container>;
};
