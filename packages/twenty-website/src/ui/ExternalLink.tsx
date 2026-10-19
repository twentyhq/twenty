'use client';

import { type AnchorHTMLAttributes } from 'react';

import { usePartnerOnAppUrl } from '@/partner-attribution/use-partner-on-app-url';

// The one place the new-tab security attributes exist. Styled variants wrap
// this (styled(ExternalLink)); React 19 forwards ref as a prop.
export function ExternalLink({
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const hrefWithPartner = usePartnerOnAppUrl(href);

  return (
    <a
      rel="noopener noreferrer"
      target="_blank"
      {...props}
      href={hrefWithPartner}
    />
  );
}
