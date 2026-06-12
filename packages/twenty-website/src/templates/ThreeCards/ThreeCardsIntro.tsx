import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledIntro = styled.div<{ $maxWidthMd?: number }>`
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
    max-width: ${({ $maxWidthMd }) =>
      $maxWidthMd ? `${$maxWidthMd}px` : theme.layout.editorial};
  }
`;

type ThreeCardsIntroProps = {
  align: 'left' | 'center';
  children: ReactNode;
  maxWidthMd?: number;
};

export function ThreeCardsIntro({
  align,
  children,
  maxWidthMd,
}: ThreeCardsIntroProps) {
  return (
    <StyledIntro $maxWidthMd={maxWidthMd} data-align={align}>
      {children}
    </StyledIntro>
  );
}
