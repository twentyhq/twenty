import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { InlineBanner } from '@ui/feedback/InlineBanner/InlineBanner';
import { IconExternalLink } from '@ui/icon';
import { ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof InlineBanner> = {
  title: 'UI/Feedback/InlineBanner',
  component: InlineBanner,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 744 } },
};

export default meta;
type Story = StoryObj<typeof InlineBanner>;

export const Default: Story = {
  args: {
    color: 'gray',
    message: 'No AI models are enabled.',
    button: { title: 'Configure models', onClick: fn() },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('button', {
      name: /Configure models/,
    });

    await expect(button).toBeEnabled();
    await userEvent.click(button);
    await expect(args.button?.onClick).toHaveBeenCalledTimes(1);
  },
};

export const DisabledAction: Story = {
  args: {
    color: 'gray',
    message: 'You’ve reached your AI usage limit.',
    button: { title: 'Upgrade', onClick: fn(), disabled: true },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('button', { name: /Upgrade/ });

    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.button?.onClick).not.toHaveBeenCalled();
  },
};

export const WithoutAction: Story = {
  args: {
    color: 'gray',
    message: 'Ask your workspace admin to enable an AI model.',
  },
};

export const DocumentationAction: Story = {
  args: {
    color: 'gray',
    message: 'Add an API key to enable AI.',
    button: { title: 'View Docs', Icon: IconExternalLink, onClick: fn() },
  },
};

export const Narrow: Story = {
  args: Default.args,
  parameters: { container: { width: 320 } },
};
