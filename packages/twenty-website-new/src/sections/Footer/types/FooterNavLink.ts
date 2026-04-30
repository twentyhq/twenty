import type { LocalizableText } from '@/lib/i18n/localizable-text';

export type FooterNavLinkType = {
  external: boolean;
  href: string;
  label: LocalizableText;
};
