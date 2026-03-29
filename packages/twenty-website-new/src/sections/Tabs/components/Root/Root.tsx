import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import type { ReactNode } from 'react';

const ContentShell = styled.div`
  position: relative;
  width: 100%;
`;

const ShapeBackdrop = styled.div`
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

  @media (min-width: ${theme.breakpoints.md}px) {
    width: 1440px;
  }
`;

const patternImageClassName = css`
  object-fit: cover;
`;

const StyledContainer = styled(Container)`
  color: ${theme.colors.secondary.text[100]};
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
  padding-bottom: ${theme.spacing(12)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(16)};
  position: relative;
  row-gap: ${theme.spacing(6)};
  text-align: center;
  width: 100%;
  z-index: 2;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(20)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(20)};
    row-gap: ${theme.spacing(8)};
  }
`;

const StyledSection = styled.section`
  background-color: ${theme.colors.primary.background[100]};
  overflow: hidden;
  width: 100%;
`;

type RootProps = { children: ReactNode };

export function Root({ children }: RootProps) {
  return (
    <StyledSection>
      <ContentShell>
        <ShapeBackdrop aria-hidden>
          <NextImage
            alt=""
            className={shapeFillClassName}
            fill
            priority
            sizes="100vw"
            src="/images/product/tabs/background-shape.png"
          />
        </ShapeBackdrop>
        <PatternLayer aria-hidden>
          <NextImage
            alt=""
            className={patternImageClassName}
            fill
            sizes="(min-width: 921px) 1440px, 100vw"
            src="/images/product/tabs/background.png"
          />
        </PatternLayer>
        <StyledContainer>{children}</StyledContainer>
      </ContentShell>
    </StyledSection>
  );
}
