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
      href: 'https://github.com/twentyhq/twenty',
      icon: 'github',
      showInDesktop: true,
      showInDrawer: true,
    },
    {
      ariaLabel: 'Discord (opens in new tab)',
      className: 'discord-link',
      href: 'https://discord.gg/cx5n4Jzs57',
      icon: 'discord',
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
