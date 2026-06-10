import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  type Icon,
} from '@tabler/icons-react';

export type MenuNavItem = {
  href: string;
  label: MessageDescriptor;
};

export type MenuSocialLink = {
  ariaLabel: string;
  href: string;
  icon: Icon;
  showInDesktop: boolean;
};

// The Resources dropdown (user guide, developers, partners, releases with
// preview panes) lands as its own increment alongside the pages it links to.
export const MENU: {
  appUrl: string;
  navItems: readonly MenuNavItem[];
  socialLinks: readonly MenuSocialLink[];
} = {
  appUrl: 'https://app.twenty.com/welcome',
  navItems: [
    { href: '/why-twenty', label: msg`Why` },
    { href: '/customers', label: msg`Customers` },
    { href: '/pricing', label: msg`Pricing` },
  ],
  socialLinks: [
    {
      ariaLabel: 'GitHub (opens in new tab)',
      href: 'https://github.com/twentyhq/twenty',
      icon: IconBrandGithub,
      showInDesktop: true,
    },
    {
      ariaLabel: 'Discord (opens in new tab)',
      href: 'https://discord.gg/cx5n4Jzs57',
      icon: IconBrandDiscord,
      showInDesktop: true,
    },
    {
      ariaLabel: 'LinkedIn (opens in new tab)',
      href: 'https://www.linkedin.com/company/twenty',
      icon: IconBrandLinkedin,
      showInDesktop: false,
    },
    {
      ariaLabel: 'X (opens in new tab)',
      href: 'https://x.com/twentycrm',
      icon: IconBrandX,
      showInDesktop: false,
    },
  ],
};
