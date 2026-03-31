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
    justify-items: center;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 688px;

    &[data-page=${Pages.Home}] {
      max-width: 900px;
    }
  }
`;

type IntroProps = {
  align: 'center' | 'left';
  children: ReactNode;
  page: Pages;
};

export function Intro({ align, children, page }: IntroProps) {
  return (
    <StyledIntro data-align={align} data-page={page}>
      {children}
    </StyledIntro>
  );
}
