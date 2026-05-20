import { Container } from '@/design-system/components';
import {
  Heading as BaseHeading,
  type HeadingProps,
} from '@/design-system/components/Heading';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

import { Points } from './ProblemPoints';
import { Visual } from './components/Visual/Visual';

const StyledSection = styled.section`
  width: 100%;
`;

const StyledContainer = styled(Container)`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(12)};
  padding-bottom: ${theme.spacing(12)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(6)};

  @media (min-width: ${theme.breakpoints.md}px) {
    column-gap: ${theme.spacing(4)};
    grid-template-columns: 1fr 1fr;
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(6)};
    padding-bottom: ${theme.spacing(10)};
    row-gap: ${theme.spacing(20)};
  }
`;

const StyledContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(10)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(15)};
    padding-left: ${theme.spacing(15)};
    padding-right: ${theme.spacing(15)};
    padding-top: ${theme.spacing(15)};
    row-gap: ${theme.spacing(20)};
  }
`;

const problemHeadingClassName = css`
  margin-top: calc(${theme.spacing(2)} - ${theme.spacing(10)});

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-top: calc(${theme.spacing(2)} - ${theme.spacing(16)});
  }
`;

type RootProps = { children: ReactNode };

function Root({ children }: RootProps) {
  return (
    <StyledSection>
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}

type ContentProps = { children: ReactNode };

function Content({ children }: ContentProps) {
  return <StyledContent>{children}</StyledContent>;
}

function Heading({
  as = 'h2',
  children,
  className,
  size = 'md',
  weight = 'light',
}: HeadingProps & { children?: ReactNode }) {
  return (
    <BaseHeading
      as={as}
      className={[problemHeadingClassName, className].filter(Boolean).join(' ')}
      size={size}
      weight={weight}
    >
      {children}
    </BaseHeading>
  );
}

export const Problem = {
  Root,
  Visual,
  Content,
  Heading,
  Points,
};
