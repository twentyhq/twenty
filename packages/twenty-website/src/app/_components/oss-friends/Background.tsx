'use client';
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';

const TOP_GRADIENT_STOP = 350;
const MIDDLE_GRADIENT_STOP = 1200;
const BOTTOM_GRADIENT_STOP = 300;

const BackgroundContainer = styled.div`
  position: absolute;
  top: 0;
  left: -50%;
  right: -50%;
  width: 220%;
  height: 100%;
  background-image: url(https://framerusercontent.com/images/nqEmdwe7yDXNsOZovuxG5zvj2E.png);
  background-size: auto 20px;
  background-repeat: repeat;
  transform-origin: center center;
  transform: rotate(-2deg);
  z-index: -2;
`;

const Gradient = styled.div`
  position: absolute;
  top: 0;
  left: -50%;
  right: -50%;
  width: 220%;
  height: 100%;
  transform: rotate(-2deg);
  background: linear-gradient(
    185deg,
    #fff ${TOP_GRADIENT_STOP}px,
    rgba(255, 255, 255, 0.08) ${MIDDLE_GRADIENT_STOP}px,
    #fff calc(100% - ${BOTTOM_GRADIENT_STOP}px)
  );
  z-index: -1;
`;

type ContainerProps = {
  containerHeight: number; // Specify that containerHeight is a number
};

const Container = styled.div<ContainerProps>`
  z-index: -2;
  top: 0;
  position: absolute;
  overflow: hidden;
  width: 100vw;
  height: ${({ containerHeight }) => containerHeight}px;
`;

export const Background = () => {
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      const height = Math.max(
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.scrollHeight,
        document.body.offsetHeight,
      );

      setContainerHeight(height);
    };

    updateHeight();

    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <Container containerHeight={containerHeight}>
      <BackgroundContainer />
      <Gradient />
    </Container>
  );
};
