import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentDecorator } from '@ui/testing';

import { AlertDialogExample } from './AlertDialogExample';
import styles from './AlertDialog.stories.module.scss';

const meta: Meta<typeof AlertDialogExample> = {
  title: 'UI/Surfaces/AlertDialog',
  component: AlertDialogExample,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'fullscreen'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AlertDialogExample>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  args: { defaultOpen: true },
};

export const Documentation: Story = {
  decorators: Default.decorators,
  args: { defaultOpen: false },
};

export const Small: Story = {
  ...Default,
  args: { defaultOpen: true, size: 'sm' },
};
export const Large: Story = {
  ...Default,
  args: { defaultOpen: true, size: 'lg' },
};
export const ExtraLarge: Story = {
  ...Default,
  args: { defaultOpen: true, size: 'xl' },
};
export const Fullscreen: Story = {
  ...Default,
  args: { defaultOpen: true, size: 'fullscreen' },
};

export const Catalog: Story = {
  ...Default,
  args: {
    defaultOpen: true,
    content: <div className={styles.record}>Acme · Company record</div>,
  },
};

export const CatalogDark: Story = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
