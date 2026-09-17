import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Modal } from '@ui/primitives/surfaces/Modal/Modal';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

import { Dialog } from '../Dialog';

const meta: Meta<typeof Dialog.Title> = {
  title: 'UI/Surfaces/Dialog',
  component: Dialog.Title,
  decorators: [ComponentDecorator],
  args: { children: 'Grant credits' },
  render: (args) => (
    <Modal isOpen padding="large" autoHeight>
      <Dialog.Title {...args} />
      <Text>Add credits to this workspace.</Text>
    </Modal>
  ),
};

export default meta;

type Story = StoryObj<typeof Dialog.Title>;

export const Documentation: Story = {};

export const Default: Story = {
  play: async () => {
    const dialog = within(document.body).getByRole('dialog', {
      name: 'Grant credits',
    });
    const title = within(dialog).getByRole('heading', { level: 2 });

    const titleStyle = getComputedStyle(title);

    await expect(title).toHaveAttribute('data-size', 'lg');
    await expect(titleStyle.marginBlockEnd).toBe('16px');
    await expect(titleStyle.textAlign).toBe('center');
    await expect(dialog).toHaveAttribute('aria-labelledby', title.id);
  },
};

export const CustomTitle: Story = {
  args: {
    level: 3,
    size: 'sm',
    style: { marginBlockEnd: 24, textAlign: 'left' },
  },
  play: async () => {
    const title = within(document.body).getByRole('heading', {
      name: 'Grant credits',
      level: 3,
    });

    const titleStyle = getComputedStyle(title);

    await expect(title).toHaveAttribute('data-size', 'sm');
    await expect(titleStyle.marginBlockEnd).toBe('24px');
    await expect(titleStyle.textAlign).toBe('left');
  },
};

export const Dark: Story = {
  ...Default,
  globals: { colorScheme: 'dark' },
};
