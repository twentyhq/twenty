import { type Meta, type StoryObj } from '@storybook/react-vite';
import { StrictMode } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { ToasterRootReplacementExample } from './ToasterRootReplacementExample';
import { ToasterSelfRemovingActionExample } from './ToasterSelfRemovingActionExample';
import { ToasterTimingExample } from './ToasterTimingExample';
import { DEFAULT_TIMING_DURATION } from './DefaultTimingDuration';
import { type ToasterTimingExampleProps } from './ToasterTimingExampleProps';

const meta: Meta<typeof ToasterTimingExample> = {
  id: 'ui-feedback-toaster-timing',
  title: 'UI/Components/Feedback/Toaster/Timing',
  component: ToasterTimingExample,
  decorators: [ComponentDecorator],
  args: { duration: DEFAULT_TIMING_DURATION, onCancel: fn(), onClose: fn() },
  parameters: { container: { width: 600, height: 400 } },
};

export default meta;
type Story = StoryObj<typeof ToasterTimingExample>;
type TimingUser = ReturnType<typeof userEvent.setup>;

const wait = (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));

const addNotification = async ({
  canvasElement,
  isPersistent = false,
}: {
  canvasElement: HTMLElement;
  isPersistent?: boolean;
}) => {
  const user = userEvent.setup();
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  await user.click(
    canvas.getByRole('button', {
      name: isPersistent
        ? 'Add persistent notification'
        : 'Add timed notification',
    }),
  );
  const toast = body.getByRole('status');
  await waitFor(() => expect(toast).toBeVisible());

  return { canvas, body, toast, user };
};

const expectExpiry = async ({
  toast,
  onClose,
  timeout = 2400,
}: {
  toast: HTMLElement;
  onClose: ToasterTimingExampleProps['onClose'];
  timeout?: number;
}) => {
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce(), { timeout });
  await waitFor(() => expect(toast).not.toBeInTheDocument());
};

const resumeCountdown = async ({
  canvas,
  toast,
  user,
}: {
  canvas: ReturnType<typeof within>;
  toast: HTMLElement;
  user: TimingUser;
}) => {
  const outside = canvas.getByRole('button', { name: 'Outside toast' });
  await user.click(outside);
  expect(outside).toHaveFocus();
  expect(toast.contains(toast.ownerDocument.activeElement)).toBe(false);
};

export const Documentation: Story = {};

export const StrictModeCountdown: Story = {
  render: (args) => (
    <StrictMode>
      <ToasterTimingExample {...args} />
    </StrictMode>
  ),
  play: async ({ canvasElement, args }) => {
    const { toast } = await addNotification({ canvasElement });
    await wait(450);
    expect(toast).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await expectExpiry({ toast, onClose: args.onClose });
  },
};

export const ContentUpdatesPreserveRemainingTime: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, body, toast, user } = await addNotification({
      canvasElement,
    });
    const update = canvas.getByRole('button', { name: 'Update content' });
    await wait(450);
    await user.click(update);
    expect(toast).toHaveTextContent('Content update 1');
    await wait(450);
    await user.click(update);
    expect(body.getByRole('status')).toBe(toast);
    expect(toast).toHaveTextContent('Content update 2');
    await expectExpiry({ toast, onClose: args.onClose, timeout: 900 });
  },
};

export const SameDurationUpdatesRestart: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, body, toast, user } = await addNotification({
      canvasElement,
    });
    const restart = canvas.getByRole('button', { name: 'Restart countdown' });
    await wait(900);
    await user.click(restart);
    await wait(900);
    expect(toast).toBeVisible();
    await user.click(restart);
    await wait(900);
    expect(body.getByRole('status')).toBe(toast);
    expect(args.onClose).not.toHaveBeenCalled();
    await expectExpiry({ toast, onClose: args.onClose, timeout: 1000 });
  },
};

export const ZeroDurationCancelsExpiry: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, toast, user } = await addNotification({ canvasElement });
    await wait(450);
    await user.click(canvas.getByRole('button', { name: 'Make persistent' }));
    await wait(1600);
    await user.click(canvas.getByRole('button', { name: 'Update content' }));
    await user.click(canvas.getByRole('button', { name: 'Update content' }));
    expect(toast).toHaveTextContent('Content update 2');
    expect(toast).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await user.click(canvas.getByRole('button', { name: 'Restart countdown' }));
    await expectExpiry({ toast, onClose: args.onClose });
  },
};

export const PersistentNotificationStartsCountdown: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, toast, user } = await addNotification({
      canvasElement,
      isPersistent: true,
    });
    await wait(1600);
    expect(toast).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await user.click(canvas.getByRole('button', { name: 'Restart countdown' }));
    await wait(900);
    expect(toast).toBeVisible();
    await expectExpiry({ toast, onClose: args.onClose, timeout: 1000 });
  },
};

export const ProgressCancelsAndRestartsCountdown: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, toast, user } = await addNotification({ canvasElement });
    await wait(450);
    await user.click(canvas.getByRole('button', { name: 'Enter progress' }));
    await wait(1600);
    await user.click(canvas.getByRole('button', { name: 'Update progress' }));
    expect(
      within(toast).getByRole('progressbar', { hidden: true }),
    ).toHaveAttribute('aria-valuenow', '75');
    expect(args.onClose).not.toHaveBeenCalled();
    await user.click(canvas.getByRole('button', { name: 'Leave progress' }));
    await wait(1100);
    expect(toast).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await expectExpiry({ toast, onClose: args.onClose, timeout: 800 });
  },
};

export const HoverAndFocusPauseIndependently: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, toast, user } = await addNotification({ canvasElement });
    await wait(450);
    const cancel = within(toast).getByRole('button', { name: 'Keep working' });
    await user.click(cancel);
    expect(cancel).toHaveFocus();
    expect(args.onCancel).toHaveBeenCalledOnce();
    await user.unhover(toast);
    await wait(1600);
    expect(toast).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await user.tab();
    expect(within(toast).getByRole('button', { name: 'Close' })).toHaveFocus();
    await wait(1600);
    expect(toast).toBeVisible();
    await user.tab({ shift: true });
    await user.hover(toast);
    await user.tab({ shift: true });
    expect(canvas.getByRole('button', { name: 'Outside toast' })).toHaveFocus();
    await wait(1600);
    expect(toast).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await user.unhover(toast);
    await expectExpiry({ toast, onClose: args.onClose, timeout: 1500 });
  },
};

export const ContentUpdatesWhilePausedPreserveRemainingTime: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, toast, user } = await addNotification({ canvasElement });
    await wait(800);
    const update = within(toast).getByRole('button', {
      name: 'Update paused content',
    });
    await user.click(update);
    await wait(1600);
    await user.click(update);
    expect(update).toHaveFocus();
    expect(toast).toHaveTextContent('Paused content update 2');
    expect(args.onClose).not.toHaveBeenCalled();
    await resumeCountdown({ canvas, toast, user });
    await expectExpiry({ toast, onClose: args.onClose, timeout: 1000 });
  },
};

export const DurationUpdatesWhilePausedRestart: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, toast, user } = await addNotification({ canvasElement });
    await wait(800);
    const restart = within(toast).getByRole('button', {
      name: 'Restart paused countdown',
    });
    await user.click(restart);
    await wait(1600);
    await user.click(restart);
    await wait(1600);
    expect(restart).toHaveFocus();
    expect(toast).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await resumeCountdown({ canvas, toast, user });
    await wait(900);
    expect(toast).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await expectExpiry({ toast, onClose: args.onClose, timeout: 1000 });
  },
};

export const ProgressExitWhilePausedStartsFreshDuration: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, toast, user } = await addNotification({ canvasElement });
    await wait(800);
    await user.click(
      within(toast).getByRole('button', { name: 'Enter paused progress' }),
    );
    await wait(1600);
    await user.click(
      within(toast).getByRole('button', { name: 'Leave paused progress' }),
    );
    await wait(1600);
    expect(toast).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await resumeCountdown({ canvas, toast, user });
    await wait(900);
    expect(toast).toBeVisible();
    await expectExpiry({ toast, onClose: args.onClose, timeout: 1000 });
  },
};

export const RemovingFocusedActionsResumesCountdown: Story = {
  play: async ({ canvasElement, args }) => {
    const { toast, user } = await addNotification({ canvasElement });
    await wait(800);
    await user.click(
      within(toast).getByRole('button', { name: 'Update paused content' }),
    );
    await wait(1600);
    await user.click(
      within(toast).getByRole('button', { name: 'Remove focused actions' }),
    );
    expect(toast.contains(toast.ownerDocument.activeElement)).toBe(false);
    await user.hover(toast);
    await user.unhover(toast);
    expect(
      within(toast).queryByRole('button', { name: 'Remove focused actions' }),
    ).not.toBeInTheDocument();
    await expectExpiry({ toast, onClose: args.onClose, timeout: 1000 });
  },
};

export const NestedFocusedActionRemovalResumesCountdown: Story = {
  render: (args) => <ToasterSelfRemovingActionExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const { toast, user } = await addNotification({ canvasElement });
    await wait(800);
    const action = within(toast).getByRole('button', {
      name: 'Remove this focused action',
    });
    await user.tab();
    await user.tab();
    expect(action).toHaveFocus();
    await wait(1600);
    expect(toast).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(action).not.toBeInTheDocument();
    expect(toast.contains(toast.ownerDocument.activeElement)).toBe(false);
    await expectExpiry({ toast, onClose: args.onClose, timeout: 1000 });
  },
};

export const FocusedRootReplacementResumesCountdown: Story = {
  render: (args) => <ToasterRootReplacementExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const { body, toast, user } = await addNotification({ canvasElement });
    await wait(800);
    const action = within(toast).getByRole('button', {
      name: 'Replace focused toast root',
    });
    await user.tab();
    await user.tab();
    expect(action).toHaveFocus();
    await wait(1600);
    expect(toast).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    const replacement = body.getByRole('status');
    expect(replacement.tagName).toBe('SECTION');
    expect(toast).not.toBeInTheDocument();
    expect(replacement.contains(replacement.ownerDocument.activeElement)).toBe(
      false,
    );
    await expectExpiry({
      toast: replacement,
      onClose: args.onClose,
      timeout: 1000,
    });
  },
};

export const ManualDismissalCancelsExpiry: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, toast, user } = await addNotification({ canvasElement });
    await wait(450);
    await user.click(within(toast).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(toast).not.toBeInTheDocument());
    await user.click(canvas.getByRole('button', { name: 'Restart countdown' }));
    await wait(1600);
    expect(args.onClose).toHaveBeenCalledOnce();
    expect(
      within(canvasElement.ownerDocument.body).queryByRole('status'),
    ).not.toBeInTheDocument();
  },
};

export const ProviderUnmountCancelsExpiry: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, toast, user } = await addNotification({ canvasElement });
    await wait(450);
    await user.click(
      canvas.getByRole('button', { name: 'Unmount notification provider' }),
    );
    expect(toast).not.toBeInTheDocument();
    await wait(1600);
    expect(args.onClose).not.toHaveBeenCalled();
  },
};

export const CountdownTracksRemainingTime: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, toast, user } = await addNotification({ canvasElement });
    const getCountdown = () =>
      toast.querySelector<HTMLElement>(
        '[style*="--toast-countdown-duration"]',
      )!;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      expect(getCountdown()).not.toBeVisible();
      await expectExpiry({ toast, onClose: args.onClose });
      return;
    }

    const getWidthFraction = () =>
      getCountdown().getBoundingClientRect().width /
      toast.getBoundingClientRect().width;

    await wait(450);
    expect(getWidthFraction()).toBeGreaterThan(0.35);
    expect(getWidthFraction()).toBeLessThan(0.85);
    const update = within(toast).getByRole('button', {
      name: 'Update paused content',
    });
    await user.click(update);
    const pausedWidthFraction = getWidthFraction();
    await wait(500);
    await user.click(update);
    expect(getWidthFraction()).toBeCloseTo(pausedWidthFraction, 1);
    await user.click(
      within(toast).getByRole('button', { name: 'Restart paused countdown' }),
    );
    expect(getWidthFraction()).toBeGreaterThan(0.95);
    await wait(500);
    expect(getWidthFraction()).toBeGreaterThan(0.95);
    await resumeCountdown({ canvas, toast, user });
    await wait(600);
    expect(getWidthFraction()).toBeGreaterThan(0.3);
    expect(getWidthFraction()).toBeLessThan(0.8);
    await expectExpiry({ toast, onClose: args.onClose, timeout: 1300 });
  },
};

export const ExpiryWithoutVisualAnimations: Story = {
  args: { disableAnimations: true },
  play: async ({ canvasElement, args }) => {
    const { toast } = await addNotification({ canvasElement });
    expect(toast.getAnimations({ subtree: true })).toHaveLength(0);
    await expectExpiry({ toast, onClose: args.onClose });
  },
};
