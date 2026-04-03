import type { FooterDataType } from '@/sections/Footer/types';

export const FOOTER_DATA: FooterDataType = {
  illustration: {
    src: 'https://app.endlesstools.io/embed/73beb0a6-bcda-410f-8e4c-a3bcd70224b0',
    title: 'Footer background',
  },
  bottom: {
    copyright: '© 2026 – Twenty',
    credit: 'Design by Ardent.',
  },
  navGroups: [
    {
      id: 'footer-sitemap',
      title: 'Sitemap',
      ctas: [],
      links: [
        { label: 'Home', href: '/', external: false },
        { label: 'Product', href: '/product', external: false },
        { label: 'Pricing', href: '/pricing', external: false },
        { label: 'Partners', href: '/partner', external: false },
        { label: 'Why Twenty', href: '/why-twenty', external: false },
      ],
    },
    {
      id: 'footer-help',
      title: 'Help',
      ctas: [],
      links: [
        { label: 'Developers', href: '#', external: false },
        { label: 'FAQ', href: '#', external: false },
        { label: 'Support', href: '#', external: false },
        { label: 'Release Notes', href: '#', external: false },
      ],
    },
    {
      id: 'footer-legal',
      title: 'Legal',
      ctas: [],
      links: [
        { label: 'Cookie Policy', href: '#', external: false },
        { label: 'Privacy Policy', href: '#', external: false },
        { label: 'Terms and Conditions', href: '#', external: false },
      ],
    },
    {
      id: 'footer-connect',
      title: 'Connect',
      ctas: [
        {
          color: 'secondary',
          href: 'https://app.twenty.com/welcome',
          label: 'Talk to us',
          type: 'anchor',
          variant: 'contained',
        },
        {
          color: 'secondary',
          href: 'https://app.twenty.com/welcome',
          label: 'Get started',
          type: 'anchor',
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
      label: '39.8K',
      ariaLabel: 'GitHub (opens in new tab)',
      showInDesktop: true,
      showInDrawer: true,
    },
    {
      href: 'https://discord.gg/cx5n4Jzs57',
      icon: 'discord',
      label: '5.6K',
      ariaLabel: 'Discord (opens in new tab)',
      className: 'discord-link',
      showInDesktop: true,
      showInDrawer: true,
    },
    {
      href: 'https://www.linkedin.com/company/twenty',
      icon: 'linkedin',
      ariaLabel: 'LinkedIn (opens in new tab)',
      showInDesktop: false,
      showInDrawer: true,
    },
    {
      href: 'https://x.com/twentycrm',
      icon: 'x',
      ariaLabel: 'X (opens in new tab)',
      showInDesktop: false,
      showInDrawer: true,
    },
  ],
};
