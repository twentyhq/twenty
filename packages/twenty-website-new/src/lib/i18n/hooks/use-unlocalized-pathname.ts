'use client';

import { usePathname } from 'next/navigation';

import { stripLocale } from '../utils/localize-href';

export const useUnlocalizedPathname = (): string => {
  const pathname = usePathname();
  return stripLocale(pathname ?? '');
};
