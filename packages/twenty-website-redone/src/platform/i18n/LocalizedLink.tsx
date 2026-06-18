'use client';

import Link from 'next/link';
import { type ComponentProps } from 'react';

import { localizeHref } from './localize-href';
import { useLocale } from './use-locale';

export type LocalizedLinkProps = ComponentProps<typeof Link> & {
  href: string;
};

// Drop-in next/link that prefixes internal hrefs with the active locale, so
// call sites always write unprefixed paths.
export function LocalizedLink({ href, ...props }: LocalizedLinkProps) {
  const locale = useLocale();
  return <Link {...props} href={localizeHref(locale, href)} />;
}
