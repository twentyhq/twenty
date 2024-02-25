'use client';

import styled from '@emotion/styled';

const BackgroundContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0px;
  width: 100%;
  height: 100%;
  max-height: 200%;
  background-image: url(https://framerusercontent.com/images/nqEmdwe7yDXNsOZovuxG5zvj2E.png);
  background-size: auto 20px;
  background-repeat: repeat;
  transform-origin: center center;
  z-index: -2;
`;

const Gradient = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  max-height: 200%;
  top: 100%;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    185deg,
    #fff 8.33%,
    rgba(255, 255, 255, 0.08) 48.95%,
    #fff 92.18%
  );
  z-index: -1;
`;

export const Background = () => {
  return (
    <>
      <BackgroundContainer />
      <Gradient />
    </>
  );
};
