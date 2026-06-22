'use client';

import { usePathname } from 'next/navigation';

import { stripLocale } from './strip-locale';

export const useUnlocalizedPathname = (): string => stripLocale(usePathname());
