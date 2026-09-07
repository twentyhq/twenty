'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { PARTNER_DIRECTORY_ANCHOR_ID } from '@/platform/routing/partner-directory-anchor-id';
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
    <BackLink href={`/partners#${PARTNER_DIRECTORY_ANCHOR_ID}`}>
      {i18n._(msg`← Twenty partners`)}
    </BackLink>
  );
}
