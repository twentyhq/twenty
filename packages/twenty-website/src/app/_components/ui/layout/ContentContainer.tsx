'use client';

import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0px 96px 0px 96px;
  @media (max-width: 809px) {
    width: 100%;
    padding: 0px 24px 0px 24px;
  }
`;

export const ContentContainer = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return <Container>{children}</Container>;
};
