import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { InlineBanner } from '@ui/components/feedback/InlineBanner/InlineBanner';
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
};

export const KeyboardAction: Story = {
  args: Default.args,
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
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
      ).not.toBeInTheDocument(),
    );
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: /Reconnect/ }),
    ).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent(args.message);
    await userEvent.tab();
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
      ).not.toBeInTheDocument(),
    );
    await userEvent.pointer({ keys: '[TouchA]', target: message });
    await expect(message).toHaveFocus();
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent(args.message);
    await userEvent.click(canvas.getByRole('button', { name: /Reconnect/ }));
    await expect(args.button?.onClick).toHaveBeenCalledTimes(1);
  },
};

export const CompactLink: Story = {
  args: {
    variant: 'compact',
    message: 'Connect your account to keep your contacts in sync.',
    button: { title: 'Connection settings', href: '#connection-settings' },
  },
};

export const CompactDanger: Story = {
  args: {
    variant: 'compact',
    color: 'danger',
    message:
      'Card payment is currently unavailable. Please verify your Stripe configuration or contact your workspace admin.',
  },
};

export const WrappingMessage: Story = {
  args: CompactDanger.args,
  parameters: { container: { width: 240 } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const message = canvas.getByText(args.message);

    await expect(message.scrollWidth).toBeLessThanOrEqual(message.clientWidth);
    await expect(getComputedStyle(message).whiteSpace).toBe('normal');
    await expect(message.getBoundingClientRect().height).toBeGreaterThan(40);
    await expect(message).not.toHaveAttribute('tabindex');
    await userEvent.hover(message);
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
    ).not.toBeInTheDocument();
  },
};

export const DestinationLink: Story = {
  args: CompactLink.args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Connection settings' });

    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('href', '#connection-settings');
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(link).toHaveFocus();
  },
};

export const CustomLink: Story = {
  args: {
    ...CompactLink.args,
    button: {
      title: 'Connection settings',
      href: 'https://twenty.com',
      target: '_blank',
      rel: 'noopener noreferrer',
      render: (
        <a href="https://twenty.com" aria-label="Open connection settings" />
      ),
      onClick: fn((event) => event.preventDefault()),
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Open connection settings' });

    await expect(link).toHaveAttribute('href', 'https://twenty.com');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.button?.onClick).toHaveBeenCalledTimes(1);
  },
};

export const CompactAction: Story = {
  args: {
    variant: 'compact',
    color: 'danger',
    message: 'Your connection needs attention.',
    button: { title: 'Reconnect', onClick: fn() },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Reconnect' });

    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.button?.onClick).toHaveBeenCalledTimes(2);
    await expect(button).toHaveFocus();
  },
};

export const HiddenAction: Story = {
  args: {
    ...Default.args,
    button: { title: 'Configure models', hidden: true, onClick: fn() },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
  },
};
