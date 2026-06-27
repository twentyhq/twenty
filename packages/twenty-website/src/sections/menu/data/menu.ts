import { msg } from '@lingui/core/macro';
import {
  IconBook,
  IconBrandLinkedin,
  IconBrandX,
  IconCode,
  IconTag,
  IconUsers,
} from '@tabler/icons-react';

import { DiscordMark, GitHubMark } from '@/icons';
import { LATEST_RELEASE } from '@/platform/releases';
import { SITE_URLS } from '@/platform/site-urls';

import { type MenuNavItem } from '../types/menu-nav-item';
import { type MenuSocialLink } from '../types/menu-social-link';

export const MENU: {
  appUrl: string;
  navItems: readonly MenuNavItem[];
  socialLinks: readonly MenuSocialLink[];
} = {
  appUrl: SITE_URLS.appWelcome,
  navItems: [
    { href: '/why-twenty', label: msg`Why` },
    {
      label: msg`Resources`,
      children: [
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
            image: LATEST_RELEASE.previewImage,
            imageAlt: msg`Twenty release ${LATEST_RELEASE.release} — ${LATEST_RELEASE.title}`,
            imageScale: 1.04,
            title: msg`See what shipped in ${LATEST_RELEASE.release}`,
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
