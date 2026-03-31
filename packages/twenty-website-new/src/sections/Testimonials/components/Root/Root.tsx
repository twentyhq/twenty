import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';
import { TestimonialsShape } from '@/sections/Testimonials/TestimonialsShape';

const StyledSection = styled.section`
  isolation: isolate;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledContainer = styled(Container)`
  padding-bottom: ${theme.spacing(22)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(22)};

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
  shapeFillColor,
}: RootProps) {
  return (
    <StyledSection style={{ backgroundColor, color }}>
      {shapeFillColor && <TestimonialsShape fillColor={shapeFillColor} />}
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
