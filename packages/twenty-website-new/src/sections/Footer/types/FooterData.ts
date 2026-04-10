import type { IllustrationId } from '@/illustrations';
import type { FooterBottomType } from './FooterBottom';
import type { FooterNavGroupType } from './FooterNavGroup';
import type { FooterSocialLinkType } from './FooterSocialLink';

export type FooterDataType = {
  bottom: FooterBottomType;
  illustration: IllustrationId;
  navGroups: FooterNavGroupType[];
  socialLinks: FooterSocialLinkType[];
};
