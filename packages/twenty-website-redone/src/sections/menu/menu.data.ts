import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconBook,
  IconBrandLinkedin,
  IconBrandX,
  IconCode,
  IconTag,
  IconUsers,
} from '@tabler/icons-react';
import { type ComponentType } from 'react';

import { DiscordMark, GitHubMark } from '@/icons';

export type MenuIconComponent = ComponentType<{
  size?: number;
  'aria-hidden'?: boolean;
}>;

export type MenuNavChildPreview = {
  image: string;
  imageAlt: string;
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
  icon: MenuIconComponent;
  preview: MenuNavChildPreview;
};

export type MenuNavItem = {
  label: MessageDescriptor;
  href?: string;
  children?: readonly MenuNavChild[];
};

export type MenuSocialLink = {
  ariaLabel: string;
  href: string;
  icon: MenuIconComponent;
  showInDesktop: boolean;
  statKey?: 'githubStars' | 'discordMembers';
};

export const MENU: {
  appUrl: string;
  navItems: readonly MenuNavItem[];
  socialLinks: readonly MenuSocialLink[];
} = {
  appUrl: 'https://app.twenty.com/welcome',
  navItems: [
    { href: '/why-twenty', label: msg`Why` },
    {
      label: msg`Resources`,
      children: [
        {
          label: msg`User Guide`,
          description: msg`Learn how to use Twenty`,
          href: 'https://docs.twenty.com/user-guide/introduction',
          external: true,
          icon: IconBook,
          preview: {
            image: '/images/menu/user-guide.webp',
            imageAlt: 'Twenty user guide preview',
            title: msg`Master every corner of Twenty`,
            description: msg`Step-by-step guides and playbooks to help your team get the most out of their workspace.`,
          },
        },
        {
          label: msg`Developers`,
          description: msg`Create apps on Twenty`,
          href: 'https://docs.twenty.com/developers/introduction',
          external: true,
          icon: IconCode,
          preview: {
            image: '/images/menu/developers.webp',
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
          icon: IconUsers,
          preview: {
            image: '/images/menu/partners.webp',
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
          icon: IconTag,
          preview: {
            image: '/images/menu/releases.webp',
            imageAlt: 'Twenty latest release',
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
      ariaLabel: 'GitHub (opens in new tab)',
      href: 'https://github.com/twentyhq/twenty',
      icon: GitHubMark,
      showInDesktop: true,
      statKey: 'githubStars',
    },
    {
      ariaLabel: 'Discord (opens in new tab)',
      href: 'https://discord.gg/cx5n4Jzs57',
      icon: DiscordMark,
      showInDesktop: true,
      statKey: 'discordMembers',
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
