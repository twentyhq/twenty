import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { InlineBanner } from '@ui/components/feedback/InlineBanner/InlineBanner';
import { IconExternalLink } from '@ui/icon';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

const NO_AI_MODELS_MESSAGE = 'No AI models are enabled.';
const MAILBOX_SYNC_LOST_MESSAGE =
  'Sync lost with mailbox tim@apple.dev. Please reconnect for updates:';
const CARD_PAYMENT_UNAVAILABLE_MESSAGE =
  'Card payment is currently unavailable. Please verify your Stripe configuration or contact your workspace admin.';

const onAction = fn();
const onLinkAction = fn((event) => event.preventDefault());

const meta: Meta<typeof InlineBanner> = {
  id: 'ui-feedback-inlinebanner',
  title: 'UI/Components/Feedback/InlineBanner',
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
    status: 'error',
    children: NO_AI_MODELS_MESSAGE,
    action: (
      <InlineBanner.Action onClick={onAction}>
        {'Configure models'}
      </InlineBanner.Action>
    ),
  },
};

export const KeyboardAction: Story = {
  args: Default.args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('button', {
      name: /Configure models/,
    });

    await userEvent.hover(canvas.getByText(NO_AI_MODELS_MESSAGE));
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
    ).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(canvas.getByText(NO_AI_MODELS_MESSAGE)).toHaveFocus();
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
    ).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(button).toBeEnabled();
    await userEvent.click(button);
    await expect(onAction).toHaveBeenCalledTimes(1);
  },
};

export const DisabledAction: Story = {
  args: {
    status: 'error',
    children: 'You’ve reached your AI usage limit.',
    action: (
      <InlineBanner.Action onClick={onAction} disabled={true}>
        {'Upgrade'}
      </InlineBanner.Action>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('button', { name: /Upgrade/ });

    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(onAction).not.toHaveBeenCalled();
  },
};

export const WithoutAction: Story = {
  args: {
    status: 'error',
    children: 'Ask your workspace admin to enable an AI model.',
  },
};

export const DocumentationAction: Story = {
  args: {
    status: 'error',
    children: 'Add an API key to enable AI.',
    action: (
      <InlineBanner.Action onClick={onAction} startIcon={<IconExternalLink />}>
        {'View Docs'}
      </InlineBanner.Action>
    ),
  },
};

export const Narrow: Story = {
  args: {
    status: 'error',
    children: NO_AI_MODELS_MESSAGE,
    action: (
      <InlineBanner.Action onClick={onAction}>
        {'Configure models'}
      </InlineBanner.Action>
    ),
  },
  parameters: { container: { width: 320 } },
};

export const Embedded: Story = {
  args: {
    status: 'error',
    children: NO_AI_MODELS_MESSAGE,
    action: (
      <InlineBanner.Action onClick={onAction}>
        {'Configure models'}
      </InlineBanner.Action>
    ),
    embedded: true,
  },
};

export const TruncatedMessage: Story = {
  args: {
    status: 'info',
    children: MAILBOX_SYNC_LOST_MESSAGE,
    action: (
      <InlineBanner.Action onClick={onAction}>
        {'Reconnect'}
      </InlineBanner.Action>
    ),
  },
  parameters: { container: { width: 320 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const message = canvas.getByText(MAILBOX_SYNC_LOST_MESSAGE);

    await expect(message.scrollWidth).toBeGreaterThan(message.clientWidth);
    await expect(getComputedStyle(message).whiteSpace).toBe('nowrap');
    await userEvent.hover(message);
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent(MAILBOX_SYNC_LOST_MESSAGE);
    await userEvent.unhover(message);
    await userEvent.tab();
    await expect(message).toHaveFocus();
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent(MAILBOX_SYNC_LOST_MESSAGE);
    await userEvent.hover(message);
    await userEvent.unhover(message);
    await expect(
      within(canvasElement.ownerDocument.body).getByRole('tooltip'),
    ).toHaveTextContent(MAILBOX_SYNC_LOST_MESSAGE);
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
    ).toHaveTextContent(MAILBOX_SYNC_LOST_MESSAGE);
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
    ).toHaveTextContent(MAILBOX_SYNC_LOST_MESSAGE);
    await userEvent.click(canvas.getByRole('button', { name: /Reconnect/ }));
    await expect(onAction).toHaveBeenCalledTimes(1);
  },
};

export const CompactLink: Story = {
  args: {
    layout: 'compact',
    children: 'Connect your account to keep your contacts in sync.',
    action: (
      <InlineBanner.Action href={'#connection-settings'}>
        {'Connection settings'}
      </InlineBanner.Action>
    ),
  },
};

export const CompactDanger: Story = {
  args: {
    layout: 'compact',
    status: 'error',
    children: CARD_PAYMENT_UNAVAILABLE_MESSAGE,
  },
};

export const WrappingMessage: Story = {
  args: CompactDanger.args,
  parameters: { container: { width: 240 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const message = canvas.getByText(CARD_PAYMENT_UNAVAILABLE_MESSAGE);

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
    action: (
      <InlineBanner.Action
        nativeButton={false}
        role="link"
        href={'https://twenty.com'}
        target={'_blank'}
        rel={'noopener noreferrer'}
        render={
          <a href="https://twenty.com" aria-label="Open connection settings" />
        }
        onClick={onLinkAction}
      >
        {'Connection settings'}
      </InlineBanner.Action>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Open connection settings' });

    await expect(link).not.toHaveAttribute('type');
    await expect(link).toHaveAttribute('href', 'https://twenty.com');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onLinkAction).toHaveBeenCalledTimes(1);
  },
};

export const CompactAction: Story = {
  args: {
    layout: 'compact',
    status: 'warning',
    variant: 'solid',
    color: 'blue',
    role: 'status',
    children: 'Your connection needs attention.',
    action: (
      <InlineBanner.Action onClick={onAction}>
        {'Reconnect'}
      </InlineBanner.Action>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Reconnect' });

    await expect(getComputedStyle(button).color).toBe(
      getComputedStyle(canvas.getByRole('status')).color,
    );

    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(onAction).toHaveBeenCalledTimes(2);
    await expect(button).toHaveFocus();
  },
};

export const HiddenAction: Story = {
  args: {
    ...Default.args,
    action: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
  },
};
