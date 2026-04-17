import { Container } from '@/design-system/components';
import { TestimonialsShape } from '@/sections/Testimonials/TestimonialsShape';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section`
  min-width: 0;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const BackgroundShape = styled.div`
  bottom: 0;
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
  children: ReactNode;
  color: string;
  shapeFillColor?: string;
};

export function Root({
  backgroundColor,
  children,
  color,
  shapeFillColor = theme.colors.primary.background[100],
}: RootProps) {
  return (
    <StyledSection style={{ backgroundColor, color }}>
      <BackgroundShape>
        <TestimonialsShape fillColor={shapeFillColor} />
      </BackgroundShape>
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
