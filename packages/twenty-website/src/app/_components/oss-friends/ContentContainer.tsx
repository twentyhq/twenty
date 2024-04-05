'use client';

import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  text-align: center;
  flex-direction: column;
  width: 100%;

  gap: 26px;
  @media (max-width: 809px) {
    width: 100%;
    padding: 0px 12px 40px 12px;
  }
`;

export const ContentContainer = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return <Container>{children}</Container>;
};
