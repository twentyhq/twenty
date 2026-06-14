'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { LocalizedLink } from '@/platform/i18n/localized-link';
import { fontFamily, fontSize, semanticColor } from '@/tokens';

const BackLink = styled(LocalizedLink)`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  text-decoration: none;
  transition: color 150ms ease;

  &:hover {
    color: ${semanticColor.ink};
  }
`;

export function BackToMarketplaceLink() {
  const { i18n } = useLingui();

  return (
    <BackLink href="/partners/list">{i18n._(msg`← Twenty partners`)}</BackLink>
  );
}
