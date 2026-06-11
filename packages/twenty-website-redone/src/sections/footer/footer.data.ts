import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { DiscordMark, GitHubMark } from '@/icons';
import { SITE_URLS } from '@/platform/site-urls';
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
  ariaLabel: MessageDescriptor;
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
          href: SITE_URLS.docsDevelopers,
          external: true,
        },
        {
          label: msg`User Guide`,
          href: SITE_URLS.docsGettingStarted,
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
          href: SITE_URLS.trustCenter,
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
          href: SITE_URLS.linkedin,
          external: true,
        },
      ],
      ctas: [
        {
          label: msg`Talk to us`,
          href: SITE_URLS.calBooking,
          variant: 'filled',
        },
        {
          label: msg`Get started`,
          href: SITE_URLS.appWelcome,
          variant: 'outlined',
        },
      ],
    },
  ],
  socialLinks: [
    {
      ariaLabel: msg`GitHub (opens in new tab)`,
      href: SITE_URLS.github,
      icon: GitHubMark,
    },
    {
      ariaLabel: msg`Discord (opens in new tab)`,
      href: SITE_URLS.discord,
      icon: DiscordMark,
    },
    {
      ariaLabel: msg`LinkedIn (opens in new tab)`,
      href: SITE_URLS.linkedin,
      icon: IconBrandLinkedin,
    },
    {
      ariaLabel: msg`X (opens in new tab)`,
      href: SITE_URLS.x,
      icon: IconBrandX,
    },
  ],
};
