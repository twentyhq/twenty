import type { MessageDescriptor } from '@lingui/core';
import type { FooterCtaType } from './footer-cta';
import type { FooterNavLinkType } from './footer-nav-link';

export type FooterNavGroupType = {
  ctas: FooterCtaType[];
  id: string;
  links: FooterNavLinkType[];
  title: MessageDescriptor;
};
