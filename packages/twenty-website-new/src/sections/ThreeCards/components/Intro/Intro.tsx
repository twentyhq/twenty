import { Pages } from '@/enums/pages';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledIntro = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(6)};
  text-align: start;

  &[data-align='center'] {
    margin-left: auto;
    margin-right: auto;
    justify-items: center;
    text-align: center;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 921px;

    &[data-align='center'][data-page=${Pages.Home}] {
      max-width: 900px;
    }

    &[data-page=${Pages.Product}] {
      max-width: 600px;
    }
  }
`;

type IntroProps = {
  align: 'left' | 'center';
  page: Pages;
  children: ReactNode;
};

export function Intro({ align, page, children }: IntroProps) {
  return (
    <StyledIntro data-align={align} data-page={page}>
      {children}
    </StyledIntro>
  );
}
