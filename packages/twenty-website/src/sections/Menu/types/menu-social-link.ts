import type { SocialIconKey } from '@/icons';

export type MenuSocialLinkType = {
  ariaLabel: string;
  className?: string;
  href: string;
  icon: SocialIconKey;
  label?: string;
  showInDesktop: boolean;
  showInDrawer: boolean;
};
