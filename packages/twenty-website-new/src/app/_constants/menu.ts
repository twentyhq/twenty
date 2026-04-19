import { getLatestReleasePreview } from '@/lib/releases/get-latest-release-preview';
import type { MenuDataType } from '@/sections/Menu/types';

const releasesPreview = getLatestReleasePreview() ?? {
  image: '/images/releases/1.23/1.23.0-easier-layouts.webp',
  imageAlt: 'Twenty latest release',
  imageScale: 1.04,
  title: 'See the latest release',
  description:
    'Track every release with changelogs, highlights and demos of the newest features.',
};

export const MENU_DATA: MenuDataType = {
  navItems: [
    { label: 'Why', href: '/why-twenty' },
    {
      label: 'Resources',
      children: [
        {
          label: 'User Guide',
          description: 'Learn how to use Twenty',
          href: 'https://docs.twenty.com/user-guide/introduction',
          external: true,
          icon: 'book',
          preview: {
            image: '/images/product/feature/contacts.webp',
            imageAlt: 'Twenty companies list',
            title: 'Master every corner of Twenty',
            description:
              'Step-by-step guides and playbooks to help your team get the most out of their workspace.',
          },
        },
        {
          label: 'Developers',
          description: 'Create apps on Twenty',
          href: 'https://docs.twenty.com/developers/introduction',
          external: true,
          icon: 'code',
          preview: {
            image: '/images/shared/menu/developers-preview.png',
            imageAlt: 'Blue developer illustration with branching arrows',
            imagePosition: 'center',
            imageScale: 1.4,
            title: 'Build on an open platform',
            description:
              'APIs, SDKs and webhooks to extend Twenty and ship apps on top of your CRM data.',
          },
        },
        {
          label: 'Partners',
          description: 'Find a Twenty partner',
          href: '/partners',
          icon: 'users',
          preview: {
            image: '/images/partner/hero/hero.webp',
            imageAlt: 'Twenty partner ecosystem',
            imagePosition: 'center',
            title: 'Team up with a Twenty expert',
            description:
              'Meet the certified agencies and consultants implementing Twenty for teams worldwide.',
          },
        },
        {
          label: 'Releases',
          description: "Discover what's new",
          href: '/releases',
          icon: 'tag',
          preview: releasesPreview,
        },
      ],
    },
    { label: 'Customers', href: '/customers' },
    { label: 'Pricing', href: '/pricing' },
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
