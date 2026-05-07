import type { Metadata } from 'next';

import { resolveLocaleParam } from '@/lib/i18n/resolve-locale-param';
import { setServerI18n } from '@/lib/i18n/set-server-i18n';

import {
  buildPageMetadata,
  type BuildPageMetadataInput,
} from './build-page-metadata';

type LocalizedMetadataArgs = {
  params: Promise<{ locale: string }>;
};

export const buildLocalizedMetadata =
  (input: Omit<BuildPageMetadataInput, 'locale'>) =>
  async ({ params }: LocalizedMetadataArgs): Promise<Metadata> => {
    const { locale: rawLocale } = await params;
    const locale = resolveLocaleParam(rawLocale);
    setServerI18n(locale);
    return buildPageMetadata({ ...input, locale });
  };
