'use client';

import Link from 'next/link';
import { type ComponentProps } from 'react';

import { localizeHref } from './localize-href';
import { useLocale } from './use-locale';

type LocalizedLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
};

export const LocalizedLink = ({ href, ...rest }: LocalizedLinkProps) => {
  const locale = useLocale();
  // oxlint-disable-next-line eslint-plugin-react(jsx-props-no-spreading)
  return <Link href={localizeHref(locale, href)} {...rest} />;
};
