import { EngagementBandShape } from '@/sections/EngagementBand/EngagementBandShape';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledStrip = styled.div`
  border-radius: ${theme.radius(1)};
  display: grid;
  grid-template-columns: 1fr;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding-top: ${theme.spacing(6)};
  padding-right: ${theme.spacing(4)};
  padding-bottom: ${theme.spacing(6)};
  padding-left: ${theme.spacing(6)};
  position: relative;
  row-gap: ${theme.spacing(6)};
  z-index: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    column-gap: ${theme.spacing(2)};
    grid-template-columns: minmax(0, 668px) minmax(0, 1fr);
    padding-right: ${theme.spacing(16)};
    row-gap: 0;
  }

  &[data-variant='primary'] {
    color: ${theme.colors.primary.text[100]};
  }

  &[data-variant='secondary'] {
    color: ${theme.colors.secondary.text[100]};
  }
`;

type StripProps = {
  children: ReactNode;
  fillColor: string;
  variant: 'primary' | 'secondary';
};

export function Strip({ children, fillColor, variant }: StripProps) {
  return (
    <StyledStrip data-variant={variant}>
      <EngagementBandShape fillColor={fillColor} />
      {children}
    </StyledStrip>
  );
}
