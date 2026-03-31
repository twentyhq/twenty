import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section`
  width: 100%;
`;

type RootProps = {
  backgroundColor: string;
  children: ReactNode;
};

export function Root({ backgroundColor, children }: RootProps) {
  return <StyledSection style={{ backgroundColor }}>{children}</StyledSection>;
}
