import type { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import type { FooterBottomType } from './FooterBottom';
import type { FooterNavGroupType } from './FooterNavGroup';
import type { FooterSocialLinkType } from './FooterSocialLink';

export type FooterDataType = {
  bottom: FooterBottomType;
  illustration: IllustrationType;
  navGroups: FooterNavGroupType[];
  socialLinks: FooterSocialLinkType[];
};
