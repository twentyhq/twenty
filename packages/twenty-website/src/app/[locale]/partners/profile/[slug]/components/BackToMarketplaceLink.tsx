'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { theme } from '@/theme';

const BackLink = styled.a`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  text-decoration: none;
  transition: color 150ms ease;

  &:hover {
    color: ${theme.colors.primary.text[100]};
  }
`;

type BackToMarketplaceLinkProps = {
  locale: string;
};

export function BackToMarketplaceLink({ locale }: BackToMarketplaceLinkProps) {
  const { i18n } = useLingui();
  return (
    <BackLink href={`/${locale}/partners/list`}>
      {i18n._(msg`← Twenty partners`)}
    </BackLink>
  );
}
