import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { DiscordMark, GitHubMark } from '@/icons';
import { type MenuIconComponent } from '@/sections/menu/menu.data';
import { IconBrandLinkedin, IconBrandX } from '@tabler/icons-react';

export type FooterNavLink = {
  label: MessageDescriptor;
  href: string;
  external?: boolean;
};

export type FooterCta = {
  label: MessageDescriptor;
  href: string;
  variant: 'filled' | 'outlined';
};

export type FooterNavGroup = {
  id: string;
  title: MessageDescriptor;
  links: readonly FooterNavLink[];
  ctas?: readonly FooterCta[];
};

export type FooterSocialLink = {
  ariaLabel: string;
  href: string;
  icon: MenuIconComponent;
};

// Sitemap now includes Product and Customers — both pages exist in the nav
// but were missing from the old footer. "Talk to us" links straight to the
// Cal.com form until the contact modal is ported.
export const FOOTER: {
  navGroups: readonly FooterNavGroup[];
  socialLinks: readonly FooterSocialLink[];
} = {
  navGroups: [
    {
      id: 'footer-sitemap',
      title: msg`Sitemap`,
      links: [
        { label: msg`Home`, href: '/' },
        { label: msg`Product`, href: '/product' },
        { label: msg`Pricing`, href: '/pricing' },
        { label: msg`Customers`, href: '/customers' },
        { label: msg`Partners`, href: '/partners' },
        { label: msg`Why Twenty`, href: '/why-twenty' },
      ],
    },
    {
      id: 'footer-help',
      title: msg`Help`,
      links: [
        {
          label: msg`Developers`,
          href: 'https://docs.twenty.com/developers/introduction',
          external: true,
        },
        {
          label: msg`User Guide`,
          href: 'https://docs.twenty.com/getting-started/introduction',
          external: true,
        },
        { label: msg`Release Notes`, href: '/releases' },
        { label: msg`Halftone generator`, href: '/halftone' },
      ],
    },
    {
      id: 'footer-legal',
      title: msg`Legal`,
      links: [
        { label: msg`Privacy Policy`, href: '/privacy-policy' },
        { label: msg`Terms and Conditions`, href: '/terms' },
        {
          label: msg`Trust Center`,
          href: 'https://trust.twenty.com',
          external: true,
        },
      ],
    },
    {
      id: 'footer-connect',
      title: msg`Connect`,
      links: [
        {
          label: msg`LinkedIn`,
          href: 'https://www.linkedin.com/company/twenty',
          external: true,
        },
      ],
      ctas: [
        {
          label: msg`Talk to us`,
          href: 'https://cal.com/forms/f7841033-0a20-4958-8c92-4e34ec128a81',
          variant: 'filled',
        },
        {
          label: msg`Get started`,
          href: 'https://app.twenty.com/welcome',
          variant: 'outlined',
        },
      ],
    },
  ],
  socialLinks: [
    {
      ariaLabel: 'GitHub (opens in new tab)',
      href: 'https://github.com/twentyhq/twenty',
      icon: GitHubMark,
    },
    {
      ariaLabel: 'Discord (opens in new tab)',
      href: 'https://discord.gg/cx5n4Jzs57',
      icon: DiscordMark,
    },
    {
      ariaLabel: 'LinkedIn (opens in new tab)',
      href: 'https://www.linkedin.com/company/twenty',
      icon: IconBrandLinkedin,
    },
    {
      ariaLabel: 'X (opens in new tab)',
      href: 'https://x.com/twentycrm',
      icon: IconBrandX,
    },
  ],
};
