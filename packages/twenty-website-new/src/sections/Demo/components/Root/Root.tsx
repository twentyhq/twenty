import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import type { ReactNode } from 'react';

const RootWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  position: relative;
  width: 100%;
`;

const BackgroundLayer = styled.div`
  align-self: stretch;
  grid-column: 1;
  grid-row: 1;
  opacity: 0.6;
  pointer-events: none;
  position: relative;
  width: 100%;
  z-index: 0;
`;

const PatternLayer = styled.div`
  bottom: 0;
  height: 60%;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  width: 100%;
`;

const patternImageClassName = css`
  object-fit: cover;
  object-position: center top;
`;

const StyledSection = styled.section`
  grid-column: 1;
  grid-row: 1;
  position: relative;
  width: 100%;
  z-index: 1;
`;

const StyledContainer = styled(Container)`
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
  padding-bottom: ${theme.spacing(16)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(16)};
  row-gap: ${theme.spacing(6)};
  text-align: center;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(24)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(24)};
  }
`;

type RootProps = { children: ReactNode };

export function Root({ children }: RootProps) {
  return (
    <RootWrapper>
      <BackgroundLayer aria-hidden>
        <PatternLayer>
          <NextImage
            alt=""
            className={patternImageClassName}
            fill
            sizes="(min-width: 921px) 100vw"
            src="/images/product/demo/background.png"
          />
        </PatternLayer>
      </BackgroundLayer>
      <StyledSection>
        <StyledContainer>{children}</StyledContainer>
      </StyledSection>
    </RootWrapper>
  );
}
