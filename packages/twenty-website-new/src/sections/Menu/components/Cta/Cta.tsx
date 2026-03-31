import { LinkButton } from '@/design-system/components';
import type { MenuScheme } from '@/sections/Menu/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const CtaContainer = styled.div`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    column-gap: ${theme.spacing(2)};
    display: grid;
    grid-auto-flow: column;
  }
`;

type CtaProps = {
  scheme: MenuScheme;
};

export function Cta({ scheme }: CtaProps) {
  const buttonColor = scheme === 'primary' ? 'secondary' : 'primary';

  return (
    <CtaContainer>
      <LinkButton
        color={buttonColor}
        href="https://app.twenty.com/welcome"
        label="Log in"
        type="anchor"
        variant="outlined"
      />
      <LinkButton
        color={buttonColor}
        href="https://app.twenty.com/welcome"
        label="Get started"
        type="anchor"
        variant="contained"
      />
    </CtaContainer>
  );
}
