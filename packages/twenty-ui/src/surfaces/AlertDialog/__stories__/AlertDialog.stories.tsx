import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { AlertDialogExample } from './AlertDialogExample';
import styles from './AlertDialog.stories.module.scss';
import { waitForAlertDialog } from './waitForAlertDialog';

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
  play: async ({ canvasElement }) => {
    const dialog = await waitForAlertDialog(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(dialog).toHaveAccessibleName('Delete this record?');
    expect(dialog).toHaveAccessibleDescription(
      'This record will be permanently deleted. This action cannot be undone.',
    );
    expect(dialog).toHaveAttribute(
      'aria-labelledby',
      body.getByRole('heading', { name: 'Delete this record?' }).id,
    );
    expect(canvasElement).not.toContainElement(dialog);
    const bounds = dialog.getBoundingClientRect();
    const viewport = canvasElement.ownerDocument.documentElement;

    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.top).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeLessThanOrEqual(viewport.clientWidth);
    expect(bounds.bottom).toBeLessThanOrEqual(viewport.clientHeight);
  },
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
