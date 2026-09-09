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

    await userEvent.hover(canvas.getByText(args.message));
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
    ).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(canvas.getByText(args.message)).toHaveFocus();
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
    ).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(button).toHaveFocus();
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
  args: {
    color: 'danger',
    message: 'No AI models are enabled.',
    button: { title: 'Configure models', onClick: fn() },
  },
  parameters: { container: { width: 320 } },
};

export const Embedded: Story = {
  args: {
    color: 'danger',
    message: 'No AI models are enabled.',
    button: { title: 'Configure models', onClick: fn() },
    embedded: true,
  },
};

export const TruncatedMessage: Story = {
  args: {
    color: 'blue',
    message:
      'Sync lost with mailbox tim@apple.dev. Please reconnect for updates:',
    button: { title: 'Reconnect', onClick: fn() },
  },
  parameters: { container: { width: 320 } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const message = canvas.getByText(args.message);

    await expect(message.scrollWidth).toBeGreaterThan(message.clientWidth);
    await expect(getComputedStyle(message).whiteSpace).toBe('nowrap');
    await userEvent.hover(message);
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent(args.message);
    await userEvent.unhover(message);
    await userEvent.tab();
    await expect(message).toHaveFocus();
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent(args.message);
    await userEvent.hover(message);
    await userEvent.unhover(message);
    await expect(
      within(canvasElement.ownerDocument.body).getByRole('tooltip'),
    ).toHaveTextContent(args.message);
    await userEvent.keyboard('{Escape}');
    await expect(message).toHaveFocus();
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
    ).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: /Reconnect/ }),
    ).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent(args.message);
    await userEvent.tab();
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
    ).not.toBeInTheDocument();
    await userEvent.pointer({ keys: '[TouchA]', target: message });
    await expect(message).toHaveFocus();
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent(args.message);
    await userEvent.click(canvas.getByRole('button', { name: /Reconnect/ }));
    await expect(args.button?.onClick).toHaveBeenCalledTimes(1);
  },
};
