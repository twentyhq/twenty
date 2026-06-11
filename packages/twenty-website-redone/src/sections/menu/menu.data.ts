import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconBook,
  IconBulb,
  IconBrandLinkedin,
  IconBrandX,
  IconCode,
  IconTag,
  IconUsers,
} from '@tabler/icons-react';
import { DiscordMark, GitHubMark, type IconComponent } from '@/icons';
import { SITE_URLS } from '@/platform/site-urls';

export type MenuNavChildPreview = {
  image: string;
  imageAlt: MessageDescriptor;
  imagePosition?: string;
  imageScale?: number;
  title: MessageDescriptor;
  description: MessageDescriptor;
};

export type MenuNavChild = {
  label: MessageDescriptor;
  description: MessageDescriptor;
  href: string;
  external?: boolean;
  icon: IconComponent;
  preview: MenuNavChildPreview;
};

export type MenuNavItem = {
  label: MessageDescriptor;
  href?: string;
  children?: readonly MenuNavChild[];
};

export type MenuSocialLink = {
  ariaLabel: MessageDescriptor;
  href: string;
  icon: IconComponent;
  showInDesktop: boolean;
  statKey?: 'githubStars' | 'discordMembers';
};

export const MENU: {
  appUrl: string;
  navItems: readonly MenuNavItem[];
  socialLinks: readonly MenuSocialLink[];
} = {
  appUrl: SITE_URLS.appWelcome,
  navItems: [
    { href: '/product', label: msg`Product` },
    {
      label: msg`Resources`,
      children: [
        {
          label: msg`Why`,
          description: msg`The story behind Twenty`,
          href: '/why-twenty',
          icon: IconBulb,
          preview: {
            image: '/images/menu/why.webp',
            imageAlt: msg`Why Twenty illustration`,
            imagePosition: 'center',
            title: msg`Why teams choose Twenty`,
            description: msg`The principles and product philosophy behind the open source CRM.`,
          },
        },
        {
          label: msg`User Guide`,
          description: msg`Learn how to use Twenty`,
          href: SITE_URLS.docsUserGuide,
          external: true,
          icon: IconBook,
          preview: {
            image: '/images/menu/user-guide.webp',
            imageAlt: msg`Twenty user guide preview`,
            title: msg`Master every corner of Twenty`,
            description: msg`Step-by-step guides and playbooks to help your team get the most out of their workspace.`,
          },
        },
        {
          label: msg`Developers`,
          description: msg`Create apps on Twenty`,
          href: SITE_URLS.docsDevelopers,
          external: true,
          icon: IconCode,
          preview: {
            image: '/images/menu/developers.webp',
            imageAlt: msg`Blue developer illustration with branching arrows`,
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
          icon: IconUsers,
          preview: {
            image: '/images/menu/partners.webp',
            imageAlt: msg`Twenty partner ecosystem`,
            imagePosition: 'center',
            title: msg`Team up with a Twenty expert`,
            description: msg`Meet the certified agencies and consultants implementing Twenty for teams worldwide.`,
          },
        },
        {
          label: msg`Releases`,
          description: msg`Discover what's new`,
          href: '/releases',
          icon: IconTag,
          preview: {
            image: '/images/menu/releases.webp',
            imageAlt: msg`Twenty latest release`,
            imageScale: 1.04,
            title: msg`See the latest release`,
            description: msg`Track every release with changelogs, highlights and demos of the newest features.`,
          },
        },
      ],
    },
    { href: '/customers', label: msg`Customers` },
    { href: '/pricing', label: msg`Pricing` },
  ],
  socialLinks: [
    {
      ariaLabel: msg`GitHub (opens in new tab)`,
      href: SITE_URLS.github,
      icon: GitHubMark,
      showInDesktop: true,
      statKey: 'githubStars',
    },
    {
      ariaLabel: msg`Discord (opens in new tab)`,
      href: SITE_URLS.discord,
      icon: DiscordMark,
      showInDesktop: true,
      statKey: 'discordMembers',
    },
    {
      ariaLabel: msg`LinkedIn (opens in new tab)`,
      href: SITE_URLS.linkedin,
      icon: IconBrandLinkedin,
      showInDesktop: false,
    },
    {
      ariaLabel: msg`X (opens in new tab)`,
      href: SITE_URLS.x,
      icon: IconBrandX,
      showInDesktop: false,
    },
  ],
};
