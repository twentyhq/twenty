import { Text } from '@ui/primitives/typography/Text/Text';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { DialogExample } from './DialogExample';

import { waitForDialog } from './waitForDialog';

const meta: Meta<typeof DialogExample> = {
  title: 'UI/Surfaces/Dialog',
  component: DialogExample,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'fullscreen'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DialogExample>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  args: { defaultOpen: true },
  play: async ({ canvasElement }) => {
    const dialog = await waitForDialog(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(dialog).toHaveAccessibleName('Edit account');
    expect(dialog).toHaveAccessibleDescription('Update the account details.');
    expect(dialog).toHaveAttribute(
      'aria-labelledby',
      body.getByRole('heading', { name: 'Edit account' }).id,
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

export const Documentation: Story = {
  ...Default,
  args: { defaultOpen: false },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Edit account',
    });
    const body = within(canvasElement.ownerDocument.body);

    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(trigger);
    const dialog = await waitForDialog(canvasElement);
    expect(dialog).toHaveAccessibleName('Edit account');
    expect(dialog).toHaveAccessibleDescription('Update the account details.');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Close' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
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
    content: <Text>Acme · Company record</Text>,
  },
};

export const CatalogDark: Story = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
