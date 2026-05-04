'use client';

import { LinkButton } from '@/design-system/components';
import type { MenuScheme } from '@/sections/Menu/types';
import { theme } from '@/theme';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
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
  const { i18n } = useLingui();
  const buttonColor = scheme === 'primary' ? 'secondary' : 'primary';

  return (
    <CtaContainer>
      <LinkButton
        color={buttonColor}
        href="https://app.twenty.com/welcome"
        label={i18n._(msg`Log in`)}
        size="small"
        type="anchor"
        variant="outlined"
      />
      <LinkButton
        color={buttonColor}
        href="https://app.twenty.com/welcome"
        label={i18n._(msg`Get started`)}
        size="small"
        type="anchor"
        variant="contained"
      />
    </CtaContainer>
  );
}
