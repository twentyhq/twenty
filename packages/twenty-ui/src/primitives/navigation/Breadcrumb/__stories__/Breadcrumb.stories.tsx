import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Text } from '@ui/primitives/typography/Text/Text';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { Breadcrumb } from '../Breadcrumb';

const LONG_CURRENT_LABEL =
  'A company name that needs more room than the page header';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Primitives/Navigation/Breadcrumb',
  component: Breadcrumb,
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 350 },
    a11y: A11Y_DEFER_COLOR_CONTRAST,
  },
  args: {
    links: [
      { children: 'Objects', href: '/objects' },
      { children: 'Companies', href: '/companies' },
      { children: 'New' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {};

export const Truncation: Story = {
  args: {
    links: [
      { children: 'Objects', href: '/objects' },
      { children: 'Companies', href: '/companies' },
      { children: LONG_CURRENT_LABEL },
    ],
  },
};

export const RichContent: Story = {
  args: {
    links: [
      { children: 'Settings', href: '/settings' },
      {
        children: <Text render={<span />}>Data model</Text>,
        title: 'Data model',
      },
    ],
  },
};

export const LinkedCurrentItem: Story = {
  args: {
    links: [
      { children: 'Objects', href: '/objects' },
      { children: 'Companies', href: '/companies' },
    ],
  },
};

export const Rtl: Story = { args: { dir: 'rtl' } };

export const Dark: Story = { globals: { colorScheme: 'dark' } };

export const SingleItem: Story = {
  args: { links: [{ children: 'Settings' }] },
};

export const Empty: Story = { args: { links: [] } };

export const NativeLinks: Story = {
  args: {
    links: [
      {
        children: 'Workspace',
        href: '#workspace',
        target: '_blank',
        rel: 'noopener noreferrer',
        referrerPolicy: 'no-referrer',
      },
      { children: 'Companies', href: '#companies', title: '' },
    ],
  },
};

export const ExplicitCurrentItem: Story = {
  args: {
    links: [
      { children: 'Workspace', href: '#workspace', 'aria-current': 'page' },
      { children: 'Company', href: '#company', 'aria-current': false },
    ],
  },
};
