import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const Wrapper = styled.div`
  padding-top: ${theme.spacing(8)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-top: ${theme.spacing(16)};
  }
`;

type BodyProps = {
  children: ReactNode;
};

export function Body({ children }: BodyProps) {
  return <Wrapper>{children}</Wrapper>;
}
