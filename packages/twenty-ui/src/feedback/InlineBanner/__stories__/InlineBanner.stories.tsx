import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { InlineBanner } from '@ui/feedback/InlineBanner/InlineBanner';
import { IconExternalLink } from '@ui/icon';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof InlineBanner> = {
  title: 'UI/Feedback/InlineBanner',
  component: InlineBanner,
  decorators: [ComponentDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    container: { width: 744 },
  },
};

export default meta;
type Story = StoryObj<typeof InlineBanner>;

export const Default: Story = {
  args: {
    color: 'danger',
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
    color: 'danger',
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
    color: 'danger',
    message: 'Ask your workspace admin to enable an AI model.',
  },
};

export const DocumentationAction: Story = {
  args: {
    color: 'danger',
    message: 'Add an API key to enable AI.',
    button: { title: 'View Docs', Icon: IconExternalLink, onClick: fn() },
  },
};

export const Narrow: Story = {
  args: Default.args,
  parameters: { container: { width: 320 } },
};

export const Embedded: Story = {
  args: { ...Default.args, color: 'danger', embedded: true },
};
