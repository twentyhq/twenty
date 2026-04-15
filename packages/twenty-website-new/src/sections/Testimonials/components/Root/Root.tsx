import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import type { ReactNode } from 'react';

const StyledSection = styled.section`
  min-width: 0;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const BackgroundShape = styled.div`
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 0;
`;

const StyledContainer = styled(Container)`
  padding-bottom: ${theme.spacing(22)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(22)};
  position: relative;
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(25)};
    padding-bottom: ${theme.spacing(25)};
  }
`;

type RootProps = {
  backgroundColor: string;
  backgroundShapeSrc?: string;
  children: ReactNode;
  color: string;
};

export function Root({
  backgroundColor,
  backgroundShapeSrc,
  children,
  color,
}: RootProps) {
  return (
    <StyledSection style={{ backgroundColor, color }}>
      {backgroundShapeSrc ? (
        <BackgroundShape>
          <NextImage
            alt=""
            sizes="100vw"
            src={backgroundShapeSrc}
            style={{ height: 'auto', width: '100%' }}
            width={1440}
            height={842}
          />
        </BackgroundShape>
      ) : null}
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
