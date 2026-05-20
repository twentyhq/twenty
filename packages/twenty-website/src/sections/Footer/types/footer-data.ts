import type { FooterBottomType } from './footer-bottom';
import type { FooterNavGroupType } from './footer-nav-group';
import type { FooterSocialLinkType } from './footer-social-link';

export type FooterDataType = {
  bottom: FooterBottomType;
  navGroups: FooterNavGroupType[];
  socialLinks: FooterSocialLinkType[];
};
