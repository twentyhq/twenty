import { COMMUNITY } from '@/constants/community';
import type { MenuDataType } from '@/sections/Menu/types';

export const MENU_DATA: MenuDataType = {
  navItems: [
    { label: 'Product', href: '/product' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Partners', href: '/partner' },
    { label: 'Why Twenty', href: '/why-twenty' },
  ],
  socialLinks: [
    {
      ariaLabel: 'GitHub (opens in new tab)',
      href: COMMUNITY.GITHUB_REPO_URL,
      icon: 'github',
      label: COMMUNITY.FALLBACK_GITHUB_LABEL,
      showInDesktop: true,
      showInDrawer: true,
    },
    {
      ariaLabel: 'Discord (opens in new tab)',
      className: 'discord-link',
      href: COMMUNITY.DISCORD_INVITE_URL,
      icon: 'discord',
      label: COMMUNITY.FALLBACK_DISCORD_LABEL,
      showInDesktop: true,
      showInDrawer: true,
    },
    {
      ariaLabel: 'LinkedIn (opens in new tab)',
      href: 'https://www.linkedin.com/company/twenty',
      icon: 'linkedin',
      showInDesktop: false,
      showInDrawer: true,
    },
    {
      ariaLabel: 'X (opens in new tab)',
      href: 'https://x.com/twentycrm',
      icon: 'x',
      showInDesktop: false,
      showInDrawer: true,
    },
  ],
};
