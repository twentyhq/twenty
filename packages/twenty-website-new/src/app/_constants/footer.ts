import type { FooterDataType } from '@/sections/Footer/types';

export const FOOTER_DATA: FooterDataType = {
  illustration: 'footerBackground',
  bottom: {
    copyright: '© 2026 – Twenty',
  },
  navGroups: [
    {
      id: 'footer-sitemap',
      title: 'Sitemap',
      ctas: [],
      links: [
        { label: 'Home', href: '/', external: false },
        { label: 'Pricing', href: '/pricing', external: false },
        { label: 'Partners', href: '/partners', external: false },
        { label: 'Why Twenty', href: '/why-twenty', external: false },
      ],
    },
    {
      id: 'footer-help',
      title: 'Help',
      ctas: [],
      links: [
        {
          label: 'Developers',
          href: 'https://docs.twenty.com/developers/introduction',
          external: true,
        },
        {
          label: 'User Guide',
          href: 'https://docs.twenty.com/getting-started/introduction',
          external: true,
        },
        { label: 'Release Notes', href: '/releases', external: false },
        {
          label: 'Halftone generator',
          href: '/halftone',
          external: false,
        },
      ],
    },
    {
      id: 'footer-legal',
      title: 'Legal',
      ctas: [],
      links: [
        { label: 'Privacy Policy', href: '/privacy-policy', external: false },
        { label: 'Terms and Conditions', href: '/terms', external: false },
      ],
    },
    {
      id: 'footer-connect',
      title: 'Connect',
      ctas: [
        {
          color: 'secondary',
          kind: 'contactModal',
          label: 'Talk to us',
          variant: 'contained',
        },
        {
          color: 'secondary',
          href: 'https://app.twenty.com/welcome',
          kind: 'link',
          label: 'Get started',
          variant: 'outlined',
        },
      ],
      links: [
        {
          label: 'LinkedIn',
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
