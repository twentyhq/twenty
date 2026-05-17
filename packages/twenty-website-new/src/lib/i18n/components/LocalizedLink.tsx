'use client';

import Link from 'next/link';
import { type ComponentProps } from 'react';

import { localizeHref } from '../utils/localize-href';
import { useLocale } from '../hooks/use-locale';

type LocalizedLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
};

export const LocalizedLink = ({ href, ...rest }: LocalizedLinkProps) => {
  const locale = useLocale();
  // oxlint-disable-next-line eslint-plugin-react(jsx-props-no-spreading)
  return <Link href={localizeHref(locale, href)} {...rest} />;
};
