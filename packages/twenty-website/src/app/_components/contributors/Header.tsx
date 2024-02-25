'use client';

import styled from '@emotion/styled';

const Title = styled.h2`
  font-size: 56px;
  font-weight: 600;
  color: #b3b3b3;
  margin-bottom: 0px;
  margin-top: 64px;

  @media (max-width: 810px) {
    font-size: 28px;
  }
`;

export const Header = () => {
  return (
    <>
      <Title>
        Our amazing <br /> <span style={{ color: 'black' }}>Contributors</span>
      </Title>
    </>
  );
};
