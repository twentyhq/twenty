export type FooterSocialIconKey = 'discord' | 'github' | 'linkedin' | 'x';

export type FooterSocialLinkType = {
  ariaLabel: string;
  href: string;
  icon: FooterSocialIconKey;
  label?: string;
};
