'use client';
import React from 'react';
import styled from '@emotion/styled';

const BACKGROUND_ROTATION = -5;

const BACKGROUND_IMAGE_URL =
  'https://framerusercontent.com/images/nqEmdwe7yDXNsOZovuxG5zvj2E.png';

const BackgroundImage = styled.div`
  position: absolute;
  height: calc(100% - 350px);
  width: 200%;
  top: 250px;
  overflow: visible;
  z-index: -3;
  background-image: url(${BACKGROUND_IMAGE_URL});
  transform: rotate(${BACKGROUND_ROTATION}deg);
  background-size: auto 20px;
  background-repeat: repeat;
  transform-origin: center center;

  @media (max-width: 1024px) {
    transform: rotate(-1deg);
    top: 100px;
    height: 100%;
  }

  @media (max-width: 800px) {
    display: none;
  }
`;

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  overflow: hidden;
  min-width: 100vw;
  max-width: 100vw;
  z-index: 0;

  &::before {
    content: '';
    position: absolute;
    top: 150px;
    left: 0;
    height: 300px;
    width: 200%;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 1),
      rgba(255, 255, 255, 0)
    );
    transform: rotate(${BACKGROUND_ROTATION}deg);
    z-index: -2;
    pointer-events: none;

    @media (max-width: 1024px) {
      height: 200px;
      top: 50px;
      transform: rotate(-1deg);
    }
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 140px;
    left: -20px;
    height: 300px;
    width: 220%;
    background: linear-gradient(
      to top,
      rgba(255, 255, 255, 1),
      rgba(255, 255, 255, 0)
    );
    transform: rotate(${BACKGROUND_ROTATION}deg);
    z-index: -2;
    pointer-events: none;

    @media (max-width: 1024px) {
      height: 200px;
      transform: rotate(-1deg);
      bottom: 0px;
    }
  }
`;

type BackgroundProps = {
  children: React.ReactNode;
};

export const Background = ({ children }: BackgroundProps) => {
  return (
    <Container>
      {children}
      <BackgroundImage />
    </Container>
  );
};
