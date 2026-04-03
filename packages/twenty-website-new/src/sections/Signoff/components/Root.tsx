import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

import { Container } from '@/design-system/components';
import { SignoffShape } from '@/sections/Signoff/SignoffShape';
import { theme } from '@/theme';

const StyledSection = styled.section`
  min-width: 0;
  width: 100%;

  &[data-shaped] {
    isolation: isolate;
    overflow: hidden;
    position: relative;
  }
`;

const StyledContainer = styled(Container)`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding-bottom: ${theme.spacing(20)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(20)};
  text-align: center;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(28)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(28)};
  }
`;

type RootPropsSimple = {
  backgroundColor: string;
  children: ReactNode;
  color: string;
  variant?: 'simple';
};

type RootPropsShaped = {
  backgroundColor: string;
  children: ReactNode;
  color: string;
  shapeFillColor: string;
  variant: 'shaped';
};

type RootProps = RootPropsSimple | RootPropsShaped;

export function Root(props: RootProps) {
  const { backgroundColor, children, color } = props;
  const isShaped = props.variant === 'shaped';
  const shapeFillColor = isShaped ? props.shapeFillColor : undefined;

  return (
    <StyledSection
      data-shaped={isShaped ? '' : undefined}
      style={{ backgroundColor, color }}
    >
      {isShaped && shapeFillColor ? (
        <SignoffShape fillColor={shapeFillColor} />
      ) : null}
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
