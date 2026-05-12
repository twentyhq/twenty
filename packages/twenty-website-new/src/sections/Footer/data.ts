import { msg } from '@lingui/core/macro';
import type { FooterDataType } from '@/sections/Footer/types';

export const FOOTER_DATA: FooterDataType = {
  bottom: {
    copyright: msg`© 2026 – Twenty`,
  },
  navGroups: [
    {
      id: 'footer-sitemap',
      title: msg`Sitemap`,
      ctas: [],
      links: [
        { label: msg`Home`, href: '/', external: false },
        { label: msg`Product`, href: '/product', external: false },
        { label: msg`Pricing`, href: '/pricing', external: false },
        { label: msg`Partners`, href: '/partners', external: false },
        {
          label: msg`Why Twenty`,
          href: '/why-twenty',
          external: false,
        },
        { label: msg`Articles`, href: '/articles', external: false },
      ],
    },
    {
      id: 'footer-help',
      title: msg`Help`,
      ctas: [],
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
        { label: msg`Release Notes`, href: '/releases', external: false },
        {
          label: msg`Halftone generator`,
          href: '/halftone',
          external: false,
        },
      ],
    },
    {
      id: 'footer-legal',
      title: msg`Legal`,
      ctas: [],
      links: [
        {
          label: msg`Privacy Policy`,
          href: '/privacy-policy',
          external: false,
        },
        { label: msg`Terms and Conditions`, href: '/terms', external: false },
      ],
    },
    {
      id: 'footer-connect',
      title: msg`Connect`,
      ctas: [
        {
          color: 'secondary',
          kind: 'contactModal',
          label: msg`Talk to us`,
          variant: 'contained',
        },
        {
          color: 'secondary',
          href: 'https://app.twenty.com/welcome',
          kind: 'link',
          label: msg`Get started`,
          variant: 'outlined',
        },
      ],
      links: [
        {
          label: msg`LinkedIn`,
          href: 'https://www.linkedin.com/company/twenty',
          external: true,
        },
      ],
    },
  ],
  socialLinks: [
    {
      href: 'https://github.com/twentyhq/twenty',
      icon: 'github',
      ariaLabel: 'GitHub (opens in new tab)',
    },
    {
      href: 'https://discord.gg/cx5n4Jzs57',
      icon: 'discord',
      ariaLabel: 'Discord (opens in new tab)',
    },
    {
      href: 'https://www.linkedin.com/company/twenty',
      icon: 'linkedin',
      ariaLabel: 'LinkedIn (opens in new tab)',
    },
    {
      href: 'https://x.com/twentycrm',
      icon: 'x',
      ariaLabel: 'X (opens in new tab)',
    },
  ],
};
