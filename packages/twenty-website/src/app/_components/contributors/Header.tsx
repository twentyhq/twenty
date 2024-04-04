'use client';

import styled from '@emotion/styled';

const Title = styled.h2`
  font-size: 56px;
  font-weight: bold;
  color: #b3b3b3;
  margin-bottom: 32px;
  margin-top: 64px;
  text-align: center;
  display: flex;
  justify-items: center;
  align-items: center;
  flex-direction: column;

  @media (max-width: 810px) {
    font-size: 32px;
    margin-bottom: 22px;
  }
`;

export const Header = () => {
  return (
    <>
      <Title>
        Our amazing <br />
        <span style={{ color: '#141414' }}>Contributors</span>
      </Title>
    </>
  );
};
