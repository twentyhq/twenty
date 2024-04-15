'use client';

import styled from '@emotion/styled';

import MotionContainer from '@/app/_components/ui/layout/LoaderAnimation';

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
  return (
    <MotionContainer>
      <Container>{children}</Container>
    </MotionContainer>
  );
};
