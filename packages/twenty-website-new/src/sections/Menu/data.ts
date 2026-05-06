import { msg } from '@lingui/core/macro';
import { getLatestReleasePreview } from '@/lib/releases/get-latest-release-preview';
import type {
  MenuDataType,
  MenuNavChildPreview,
  MenuNavItemType,
  MenuSocialLinkType,
} from '@/sections/Menu/types';

const FALLBACK_RELEASES_PREVIEW: MenuNavChildPreview = {
  image: '/images/releases/1.23/1.23.0-easier-layouts.webp',
  imageAlt: 'Twenty latest release',
  imageScale: 1.04,
  title: msg`See the latest release`,
  description: msg`Track every release with changelogs, highlights and demos of the newest features.`,
};

function buildNavItems(): MenuNavItemType[] {
  const releasesPreview =
    getLatestReleasePreview() ?? FALLBACK_RELEASES_PREVIEW;

  return [
    { label: msg`Why`, href: '/why-twenty' },
    {
      label: msg`Resources`,
      children: [
        {
          label: msg`User Guide`,
          description: msg`Learn how to use Twenty`,
          href: 'https://docs.twenty.com/user-guide/introduction',
          external: true,
          icon: 'book',
          preview: {
            image: '/images/product/feature/contacts.webp',
            imageAlt: 'Twenty companies list',
            title: msg`Master every corner of Twenty`,
            description: msg`Step-by-step guides and playbooks to help your team get the most out of their workspace.`,
          },
        },
        {
          label: msg`Developers`,
          description: msg`Create apps on Twenty`,
          href: 'https://docs.twenty.com/developers/introduction',
          external: true,
          icon: 'code',
          preview: {
            image: '/images/shared/menu/developers-preview.png',
            imageAlt: 'Blue developer illustration with branching arrows',
            imagePosition: 'center',
            imageScale: 1.6,
            title: msg`Build on an open platform`,
            description: msg`APIs, SDKs and webhooks to extend Twenty and ship apps on top of your CRM data.`,
          },
        },
        {
          label: msg`Partners`,
          description: msg`Find a Twenty partner`,
          href: '/partners',
          icon: 'users',
          preview: {
            image: '/images/partner/hero/hero.webp',
            imageAlt: 'Twenty partner ecosystem',
            imagePosition: 'center',
            title: msg`Team up with a Twenty expert`,
            description: msg`Meet the certified agencies and consultants implementing Twenty for teams worldwide.`,
          },
        },
        {
          label: msg`Releases`,
          description: msg`Discover what's new`,
          href: '/releases',
          icon: 'tag',
          preview: releasesPreview,
        },
      ],
    },
    { label: msg`Customers`, href: '/customers' },
    { label: msg`Pricing`, href: '/pricing' },
  ];
}

const SOCIAL_LINKS: MenuSocialLinkType[] = [
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
];

export const MENU_DATA: MenuDataType = {
  get navItems() {
    return buildNavItems();
  },
  socialLinks: SOCIAL_LINKS,
};
