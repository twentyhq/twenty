import type { LocalizableText } from '@/lib/i18n/localizable-text';
import type { FooterCtaType } from './FooterCta';
import type { FooterNavLinkType } from './FooterNavLink';

export type FooterNavGroupType = {
  ctas: FooterCtaType[];
  id: string;
  links: FooterNavLinkType[];
  title: LocalizableText;
};
