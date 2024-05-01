'use client';

import styled from '@emotion/styled';

const StyledLineContainer = styled.div`
  width: 810px;
  margin: 0 auto;
  display: flex;

  @media (max-width: 810px) {
    width: auto;
    display: block;
    margin: 24px 0px 64px;
  }
`;

const StyledLine = styled.div`
  height: 1px;
  background-color: #d9d9d9;
  margin-left: 148px;
  margin-top: 40px;
  width: 100%;

  @media (max-width: 810px) {
    margin: 0;
  }
`;

export const Line = () => {
  return (
    <StyledLineContainer>
      <StyledLine />
    </StyledLineContainer>
  );
};
