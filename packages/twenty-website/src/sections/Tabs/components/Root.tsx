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

const TabBackgrounds = styled.div`
  align-self: stretch;
  grid-column: 1;
  grid-row: 1;
  min-height: 0;
  pointer-events: none;
  position: relative;
  width: 100%;
  z-index: 0;
`;

const BackgroundShape = styled.div`
  bottom: 0;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
`;

const ShapeClip = styled.div`
  bottom: 0;
  left: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 0;
`;

const shapeFillClassName = css`
  object-fit: cover;
  object-position: center top;
`;

const PatternLayer = styled.div`
  bottom: -81px;
  height: 575px;
  left: 50%;
  opacity: 0.4;
  pointer-events: none;
  position: absolute;
  transform: translateX(-50%);
  width: 100%;
  z-index: 1;
`;

const patternImageClassName = css`
  object-fit: cover;
`;

const StyledSection = styled.section`
  align-self: start;
  grid-column: 1;
  grid-row: 1;
  position: relative;
  width: 100%;
  z-index: 2;
`;

const StyledContainer = styled(Container)`
  color: ${theme.colors.secondary.text[100]};
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
    padding-bottom: ${theme.spacing(40)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(40)};
    row-gap: ${theme.spacing(6)};
  }
`;

type RootProps = { children: ReactNode };

export function Root({ children }: RootProps) {
  return (
    <RootWrapper>
      <TabBackgrounds aria-hidden>
        <BackgroundShape>
          <ShapeClip>
            <NextImage
              alt=""
              className={shapeFillClassName}
              fill
              priority
              sizes="100vw"
              src="/images/product/tabs/background-shape.webp"
            />
          </ShapeClip>
          <PatternLayer>
            <NextImage
              alt=""
              className={patternImageClassName}
              fill
              sizes="100vw"
              src="/images/product/tabs/background.webp"
            />
          </PatternLayer>
        </BackgroundShape>
      </TabBackgrounds>
      <StyledSection>
        <StyledContainer data-scheme="dark">{children}</StyledContainer>
      </StyledSection>
    </RootWrapper>
  );
}
