import { type Meta, type StoryObj } from '@storybook/react-vite';
import { StrictMode } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { ToasterLifecycleExample } from './ToasterLifecycleExample';
import { ToasterLifecycleTimingOverrideExample } from './ToasterLifecycleTimingOverrideExample';
import { ToasterPortalExample } from './ToasterPortalExample';
import { ToasterProviderLayoutReplayEffect } from './ToasterProviderLayoutReplayEffect';
import { ToasterProviderPassiveReplayEffect } from './ToasterProviderPassiveReplayEffect';
import { ToasterProviderReplayExample } from './ToasterProviderReplayExample';
import { ToasterProviderSuspenseExample } from './ToasterProviderSuspenseExample';

const meta: Meta<typeof ToasterLifecycleExample> = {
  id: 'ui-feedback-toaster-lifecycle',
  title: 'UI/Components/Feedback/Toaster/Lifecycle',
  component: ToasterLifecycleExample,
  decorators: [ComponentDecorator],
  args: { duration: 1800, onClose: fn() },
  parameters: { container: { width: 800, height: 350 } },
};

export default meta;
type Story = StoryObj<typeof ToasterLifecycleExample>;

const wait = (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));

const getLifecycle = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  const user = userEvent.setup();
  const first = within(
    body.getByRole('region', { name: 'First lifecycle notifications' }),
  );
  const second = within(
    body.getByRole('region', { name: 'Second lifecycle notifications' }),
  );

  return { canvas, body, user, first, second };
};

export const Documentation: Story = {};

export const ReactiveLimitPreservesNewestNotifications: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, user, first, second } = getLifecycle(canvasElement);
    const add = canvas.getByRole('button', {
      name: 'Add persistent notification',
    });
    await user.click(add);
    await user.click(add);
    await user.click(add);
    const firstNotifications = first.getAllByRole('status');
    const secondNotifications = second.getAllByRole('status');
    const newestFirst = firstNotifications[2]!;
    const newestSecond = secondNotifications[2]!;
    const newestId = newestFirst.id;
    expect(secondNotifications.map((notification) => notification.id)).toEqual(
      firstNotifications.map((notification) => notification.id),
    );
    await user.click(
      canvas.getByRole('button', { name: 'Limit to one notification' }),
    );
    await waitFor(() => {
      expect(first.getAllByRole('status')).toHaveLength(1);
      expect(second.getAllByRole('status')).toHaveLength(1);
    });
    expect(first.getByRole('status')).toBe(newestFirst);
    expect(second.getByRole('status')).toBe(newestSecond);
    expect(newestFirst.id).toBe(newestId);
    expect(args.onClose).toHaveBeenNthCalledWith(1, 'Lifecycle notification 1');
    expect(args.onClose).toHaveBeenNthCalledWith(2, 'Lifecycle notification 2');
    await user.click(
      canvas.getByRole('button', { name: 'Limit to one notification' }),
    );
    expect(args.onClose).toHaveBeenCalledTimes(2);
    await user.click(
      canvas.getByRole('button', { name: 'Limit to four notifications' }),
    );
    await user.click(add);
    await user.click(add);
    expect(first.getAllByRole('status')).toHaveLength(3);
    expect(second.getAllByRole('status')).toHaveLength(3);
    expect(first.getAllByRole('status')[0]).toBe(newestFirst);
    expect(
      first
        .getAllByRole('status')
        .map((notification) => notification.textContent),
    ).toEqual(
      second
        .getAllByRole('status')
        .map((notification) => notification.textContent),
    );
    expect(args.onClose).toHaveBeenCalledTimes(2);
  },
};

export const ProviderLimitsAndUpdatesRemainIsolated: Story = {
  args: { hasIndependentProvider: true },
  play: async ({ canvasElement, args }) => {
    const { canvas, body, user, first } = getLifecycle(canvasElement);
    const independentSource = within(
      canvas.getByRole('region', { name: 'Independent source' }),
    );
    const independent = within(
      body.getByRole('region', { name: 'Independent notifications' }),
    );
    const add = canvas.getByRole('button', {
      name: 'Add persistent notification',
    });
    await user.click(add);
    await user.click(add);
    await user.click(add);
    await user.click(
      independentSource.getByRole('button', { name: 'Add notification' }),
    );
    const independentToast = independent.getByRole('status');
    await user.click(
      canvas.getByRole('button', { name: 'Limit to one notification' }),
    );
    await waitFor(() => expect(first.getAllByRole('status')).toHaveLength(1));
    expect(independent.getByRole('status')).toBe(independentToast);
    expect(independentToast).toHaveTextContent('Notification 1');
    await user.click(
      within(
        canvas.getByRole('region', { name: 'Lifecycle source' }),
      ).getByRole('button', { name: 'Update last notification' }),
    );
    expect(first.getByRole('status')).toHaveTextContent(
      'Updated lifecycle notification',
    );
    expect(independentToast).toHaveTextContent('Notification 1');
    await user.click(
      canvas.getByRole('button', { name: 'Unmount notification provider' }),
    );
    expect(independentToast).toBeVisible();
    expect(args.onClose).toHaveBeenCalledTimes(2);
    await user.click(
      independentSource.getByRole('button', {
        name: 'Close all notifications',
      }),
    );
    await waitFor(() => expect(independentToast).not.toBeInTheDocument());
    expect(args.onClose).toHaveBeenCalledTimes(3);
    expect(args.onClose).toHaveBeenLastCalledWith('Independent notification');
  },
};

export const MirrorsShareUpdatesAndDismissal: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, user, first, second } = getLifecycle(canvasElement);
    await user.click(
      canvas.getByRole('button', { name: 'Add persistent notification' }),
    );
    const firstToast = first.getByRole('status');
    const secondToast = second.getByRole('status');
    expect(firstToast.id).toBe(secondToast.id);
    await user.click(
      canvas.getByRole('button', { name: 'Update last notification' }),
    );
    expect(first.getByRole('status')).toBe(firstToast);
    expect(second.getByRole('status')).toBe(secondToast);
    expect(firstToast).toHaveTextContent('Updated lifecycle notification');
    expect(secondToast).toHaveTextContent('Updated lifecycle notification');
    await user.click(
      canvas.getByRole('button', { name: 'Dismiss and update notification' }),
    );
    expect(args.onClose).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(firstToast).not.toBeInTheDocument();
      expect(secondToast).not.toBeInTheDocument();
    });
    await user.click(
      canvas.getByRole('button', { name: 'Restart last countdown' }),
    );
    await user.click(
      canvas.getByRole('button', { name: 'Update last notification' }),
    );
    await wait(2000);
    expect(first.queryByRole('status')).not.toBeInTheDocument();
    expect(second.queryByRole('status')).not.toBeInTheDocument();
    expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const MirrorsExpireOnce: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, user, first, second } = getLifecycle(canvasElement);
    await user.click(
      canvas.getByRole('button', { name: 'Add timed notification' }),
    );
    const firstToast = first.getByRole('status');
    const secondToast = second.getByRole('status');
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce(), {
      timeout: 2600,
    });
    await waitFor(() => {
      expect(firstToast).not.toBeInTheDocument();
      expect(secondToast).not.toBeInTheDocument();
    });
    await wait(500);
    expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const UndefinedDurationOverrideRestoresDefaultCountdown: Story = {
  args: { duration: 1200 },
  render: (args) => (
    <ToasterLifecycleTimingOverrideExample
      duration={args.duration}
      initialTimingOverrides={{ duration: 400 }}
      onClose={args.onClose}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const { canvas, user, first, second } = getLifecycle(canvasElement);
    const add = canvas.getByRole('button', {
      name: 'Add override notification',
    });
    await user.click(add);
    const initialFirst = first.getByRole('status');
    const initialSecond = second.getByRole('status');
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce(), {
      timeout: 1000,
    });
    await waitFor(() => {
      expect(initialFirst).not.toBeInTheDocument();
      expect(initialSecond).not.toBeInTheDocument();
    });
    await user.click(
      canvas.getByRole('button', { name: 'Use default duration override' }),
    );
    await user.click(add);
    const defaultFirst = first.getByRole('status');
    const defaultSecond = second.getByRole('status');
    expect(defaultFirst.id).toBe(defaultSecond.id);
    await wait(1700);
    expect(defaultFirst).toBeVisible();
    expect(defaultSecond).toBeVisible();
    expect(args.onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(args.onClose).toHaveBeenCalledTimes(2), {
      timeout: 5000,
    });
    await waitFor(() => {
      expect(defaultFirst).not.toBeInTheDocument();
      expect(defaultSecond).not.toBeInTheDocument();
    });
    expect(args.onClose).toHaveBeenCalledTimes(2);
    expect(args.onClose).toHaveBeenNthCalledWith(1, 'Override notification 1');
    expect(args.onClose).toHaveBeenNthCalledWith(2, 'Override notification 2');
  },
};

export const UndefinedProgressOverrideStartsStoredCountdown: Story = {
  args: { duration: 800 },
  render: (args) => (
    <ToasterLifecycleTimingOverrideExample
      duration={args.duration}
      progress={25}
      initialTimingOverrides={{ progress: 75 }}
      onClose={args.onClose}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const { canvas, user, first, second } = getLifecycle(canvasElement);
    await user.click(
      canvas.getByRole('button', { name: 'Add override notification' }),
    );
    const firstToast = first.getByRole('status');
    const secondToast = second.getByRole('status');
    expect(
      within(firstToast).getByRole('progressbar', { hidden: true }),
    ).toHaveAttribute('aria-valuenow', '75');
    expect(
      within(secondToast).getByRole('progressbar', { hidden: true }),
    ).toHaveAttribute('aria-valuenow', '75');
    await wait(1200);
    expect(firstToast).toBeVisible();
    expect(secondToast).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await user.click(
      canvas.getByRole('button', { name: 'Clear progress override' }),
    );
    expect(
      within(firstToast).queryByRole('progressbar', { hidden: true }),
    ).not.toBeInTheDocument();
    expect(
      within(secondToast).queryByRole('progressbar', { hidden: true }),
    ).not.toBeInTheDocument();
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce(), {
      timeout: 1600,
    });
    await waitFor(() => {
      expect(firstToast).not.toBeInTheDocument();
      expect(secondToast).not.toBeInTheDocument();
    });
    expect(args.onClose).toHaveBeenCalledWith('Override notification 1');
  },
};

export const StrictModeMirrorsExpireAndTeardownOnce: Story = {
  render: (args) => (
    <StrictMode>
      <ToasterLifecycleExample
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...args}
      />
    </StrictMode>
  ),
  play: async ({ canvasElement, args }) => {
    const { canvas, body, user, first, second } = getLifecycle(canvasElement);
    const add = canvas.getByRole('button', { name: 'Add timed notification' });
    await user.click(add);
    const firstToast = first.getByRole('status');
    const secondToast = second.getByRole('status');
    expect(firstToast.id).toBe(secondToast.id);
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce(), {
      timeout: 2600,
    });
    await waitFor(() => {
      expect(firstToast).not.toBeInTheDocument();
      expect(secondToast).not.toBeInTheDocument();
    });
    await user.click(add);
    await wait(400);
    await user.click(
      canvas.getByRole('button', { name: 'Unmount notification provider' }),
    );
    await wait(2000);
    expect(body.queryByRole('status')).not.toBeInTheDocument();
    expect(args.onClose).toHaveBeenCalledOnce();
    expect(args.onClose).toHaveBeenCalledWith('Lifecycle notification 1');
  },
};

export const HoverAndFocusPauseAcrossMirrors: Story = {
  args: { hasUnrelatedNotificationActions: true },
  play: async ({ canvasElement, args }) => {
    const { canvas, user, first, second } = getLifecycle(canvasElement);
    await user.click(
      canvas.getByRole('button', { name: 'Add timed notification' }),
    );
    const firstToast = first.getByRole('status');
    const secondToast = second.getByRole('status');
    await wait(400);
    const action = within(firstToast).getByRole('button', {
      name: 'Notification action',
    });
    await user.click(action);
    await user.unhover(firstToast);
    await user.hover(secondToast);
    expect(action).toHaveFocus();
    const getCountdown = (toast: HTMLElement) =>
      toast.querySelector<HTMLElement>(
        '[style*="--toast-countdown-duration"]',
      )!;
    const firstCountdown = getCountdown(firstToast);
    const secondCountdown = getCountdown(secondToast);
    expect(firstCountdown).toHaveAttribute('data-paused');
    expect(secondCountdown).toHaveAttribute('data-paused');
    await user.click(
      within(firstToast).getByRole('button', {
        name: 'Add unrelated notification',
      }),
    );
    expect(getCountdown(firstToast)).toBe(firstCountdown);
    expect(getCountdown(secondToast)).toBe(secondCountdown);
    await user.click(
      within(firstToast).getByRole('button', {
        name: 'Update unrelated notification',
      }),
    );
    expect(first.getByText('Updated unrelated notification')).toBeVisible();
    expect(second.getByText('Updated unrelated notification')).toBeVisible();
    expect(getCountdown(firstToast)).toBe(firstCountdown);
    expect(getCountdown(secondToast)).toBe(secondCountdown);
    await user.unhover(firstToast);
    await user.hover(secondToast);
    await wait(2000);
    expect(firstToast).toBeVisible();
    expect(secondToast).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await user.click(
      canvas.getByRole('button', { name: 'Outside notifications' }),
    );
    await user.hover(secondToast);
    await wait(2000);
    expect(firstToast).toBeVisible();
    expect(secondToast).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await user.unhover(secondToast);
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce(), {
      timeout: 1800,
    });
    await waitFor(() => {
      expect(firstToast).not.toBeInTheDocument();
      expect(secondToast).not.toBeInTheDocument();
    });
  },
};

export const LateMirrorMountSharesRemainingTime: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, body, user, first } = getLifecycle(canvasElement);
    await user.click(
      canvas.getByRole('button', { name: 'Detach second renderer' }),
    );
    await user.click(
      canvas.getByRole('button', { name: 'Add timed notification' }),
    );
    const original = first.getByRole('status');
    await wait(700);
    await user.click(
      canvas.getByRole('button', { name: 'Mount second renderer' }),
    );
    const mirror = within(
      body.getByRole('region', { name: 'Second lifecycle notifications' }),
    ).getByRole('status');
    expect(mirror.id).toBe(original.id);
    await wait(400);
    expect(original).toBeVisible();
    expect(mirror).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce(), {
      timeout: 1000,
    });
    await waitFor(() => {
      expect(original).not.toBeInTheDocument();
      expect(mirror).not.toBeInTheDocument();
    });
  },
};

export const DetachingOneMirrorKeepsCountdownRunning: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, user, second } = getLifecycle(canvasElement);
    await user.click(
      canvas.getByRole('button', { name: 'Add timed notification' }),
    );
    const remainingMirror = second.getByRole('status');
    await wait(700);
    await user.click(
      canvas.getByRole('button', { name: 'Detach first renderer' }),
    );
    expect(second.getByRole('status')).toBe(remainingMirror);
    await wait(400);
    expect(remainingMirror).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce(), {
      timeout: 1000,
    });
    await waitFor(() => expect(remainingMirror).not.toBeInTheDocument());
  },
};

export const LastRendererDetachPreservesRemainingTime: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, body, user, first } = getLifecycle(canvasElement);
    await user.click(
      canvas.getByRole('button', { name: 'Add timed notification' }),
    );
    const originalId = first.getByRole('status').id;
    await wait(700);
    await user.click(
      canvas.getByRole('button', { name: 'Detach all renderers' }),
    );
    await wait(2000);
    expect(body.queryByRole('status')).not.toBeInTheDocument();
    expect(args.onClose).not.toHaveBeenCalled();
    await user.click(
      canvas.getByRole('button', { name: 'Mount first renderer' }),
    );
    const remounted = body.getByRole('status');
    expect(remounted.id).toBe(originalId);
    await wait(400);
    expect(remounted).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce(), {
      timeout: 1000,
    });
    await waitFor(() => expect(remounted).not.toBeInTheDocument());
  },
};

export const ExitWaitsForEveryMirror: Story = {
  args: { hasSlowMirrorExit: true },
  play: async ({ canvasElement, args }) => {
    const { canvas, body, user, first, second } = getLifecycle(canvasElement);
    await user.click(
      canvas.getByRole('button', { name: 'Add persistent notification' }),
    );
    const firstToast = first.getByRole('status');
    const secondToast = second.getByRole('status');
    const firstRegion = body.getByRole('region', {
      name: 'First lifecycle notifications',
    });
    const secondRegion = body.getByRole('region', {
      name: 'Second lifecycle notifications',
    });
    await waitFor(() => {
      expect(firstRegion.getAnimations({ subtree: true })).toHaveLength(0);
      expect(secondRegion.getAnimations({ subtree: true })).toHaveLength(0);
    });
    await user.click(
      canvas.getByRole('button', { name: 'Close last notification' }),
    );
    expect(args.onClose).toHaveBeenCalledOnce();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await wait(650);
      expect(firstToast).toBeInTheDocument();
      expect(secondToast).toBeInTheDocument();
    }
    await waitFor(
      () => {
        expect(firstToast).not.toBeInTheDocument();
        expect(secondToast).not.toBeInTheDocument();
      },
      { timeout: 1800 },
    );
    expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const DetachingClosingRenderersDoesNotReviveNotifications: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, body, user, first } = getLifecycle(canvasElement);
    await user.click(
      canvas.getByRole('button', { name: 'Add persistent notification' }),
    );
    const originalId = first.getByRole('status').id;
    await user.click(
      canvas.getByRole('button', { name: 'Dismiss and detach renderers' }),
    );
    expect(args.onClose).toHaveBeenCalledOnce();
    await user.click(
      canvas.getByRole('button', { name: 'Mount both renderers' }),
    );
    expect(body.queryByRole('status')).not.toBeInTheDocument();
    await user.click(
      canvas.getByRole('button', { name: 'Restart last countdown' }),
    );
    await user.click(
      canvas.getByRole('button', { name: 'Update last notification' }),
    );
    expect(body.queryByRole('status')).not.toBeInTheDocument();
    await user.click(
      canvas.getByRole('button', { name: 'Add persistent notification' }),
    );
    const replacement = within(
      body.getByRole('region', { name: 'First lifecycle notifications' }),
    ).getByRole('status');
    expect(replacement.id).not.toBe(originalId);
    await wait(2000);
    expect(replacement).toBeVisible();
    expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const ProviderRemountCancelsOldCountdowns: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, body, user, first } = getLifecycle(canvasElement);
    await user.click(
      canvas.getByRole('button', { name: 'Add timed notification' }),
    );
    const originalId = first.getByRole('status').id;
    await wait(500);
    await user.click(
      canvas.getByRole('button', { name: 'Unmount notification provider' }),
    );
    await user.click(
      canvas.getByRole('button', { name: 'Mount notification provider' }),
    );
    expect(body.queryByRole('status')).not.toBeInTheDocument();
    await user.click(
      canvas.getByRole('button', { name: 'Add persistent notification' }),
    );
    const replacement = within(
      body.getByRole('region', { name: 'First lifecycle notifications' }),
    ).getByRole('status');
    expect(replacement.id).not.toBe(originalId);
    await wait(2000);
    expect(replacement).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await user.click(
      canvas.getByRole('button', { name: 'Close last notification' }),
    );
    expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const PreviousProviderOperationsRemainInactive: Story = {
  play: async ({ canvasElement, args }) => {
    const { canvas, body, user, first } = getLifecycle(canvasElement);
    const add = canvas.getByRole('button', {
      name: 'Add persistent notification',
    });
    const runPreviousOperations = canvas.getByRole('button', {
      name: 'Run previous provider operations',
    });
    await user.click(add);
    const originalId = first.getByRole('status').id;
    await user.click(
      canvas.getByRole('button', { name: 'Unmount notification provider' }),
    );
    await user.click(runPreviousOperations);
    expect(body.queryByRole('status')).not.toBeInTheDocument();
    expect(args.onClose).not.toHaveBeenCalled();
    await user.click(
      canvas.getByRole('button', { name: 'Mount notification provider' }),
    );
    await user.click(
      canvas.getByRole('button', { name: 'Add persistent notification' }),
    );
    const replacementFirst = within(
      body.getByRole('region', { name: 'First lifecycle notifications' }),
    ).getByRole('status');
    const replacementSecond = within(
      body.getByRole('region', { name: 'Second lifecycle notifications' }),
    ).getByRole('status');
    await waitFor(() => {
      expect(replacementFirst).toBeVisible();
      expect(replacementSecond).toBeVisible();
    });
    const replacementId = replacementFirst.id;
    expect(replacementId).not.toBe(originalId);
    await user.click(
      canvas.getByRole('button', { name: 'Update last notification' }),
    );
    await user.click(runPreviousOperations);
    await user.click(runPreviousOperations);
    expect(body.getAllByRole('status')).toHaveLength(2);
    expect(replacementFirst).toBeVisible();
    expect(replacementSecond).toBeVisible();
    expect(replacementFirst.id).toBe(replacementId);
    expect(replacementSecond.id).toBe(replacementId);
    expect(replacementFirst).toHaveTextContent(
      'Updated lifecycle notification',
    );
    expect(replacementSecond).toHaveTextContent(
      'Updated lifecycle notification',
    );
    expect(
      body.queryByText('Previous provider notification enqueued'),
    ).not.toBeInTheDocument();
    expect(args.onClose).not.toHaveBeenCalled();
    await user.click(
      canvas.getByRole('button', { name: 'Close last notification' }),
    );
    await waitFor(() => {
      expect(replacementFirst).not.toBeInTheDocument();
      expect(replacementSecond).not.toBeInTheDocument();
    });
    expect(args.onClose).toHaveBeenCalledOnce();
    expect(args.onClose).toHaveBeenCalledWith('Lifecycle notification 1');
  },
};

export const ProviderRemountIgnoresOldExits: Story = {
  args: { hasSlowMirrorExit: true },
  play: async ({ canvasElement, args }) => {
    const { canvas, body, user, first } = getLifecycle(canvasElement);
    await user.click(
      canvas.getByRole('button', { name: 'Add persistent notification' }),
    );
    const originalId = first.getByRole('status').id;
    await user.click(
      canvas.getByRole('button', { name: 'Close last notification' }),
    );
    await user.click(
      canvas.getByRole('button', { name: 'Unmount notification provider' }),
    );
    await user.click(
      canvas.getByRole('button', { name: 'Mount notification provider' }),
    );
    await user.click(
      canvas.getByRole('button', { name: 'Add persistent notification' }),
    );
    const replacement = within(
      body.getByRole('region', { name: 'First lifecycle notifications' }),
    ).getByRole('status');
    expect(replacement.id).not.toBe(originalId);
    await wait(1600);
    expect(replacement).toBeVisible();
    expect(args.onClose).toHaveBeenCalledOnce();
    await user.click(
      canvas.getByRole('button', { name: 'Close last notification' }),
    );
    expect(args.onClose).toHaveBeenCalledTimes(2);
  },
};

export const PortalDocumentation: Story = {
  render: () => <ToasterPortalExample isScoped />,
};

export const DefaultAndExplicitPortalTargets: Story = {
  render: () => <ToasterPortalExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const user = userEvent.setup();
    await user.click(canvas.getByRole('button', { name: 'Add notification' }));
    const region = body.getByRole('region', { name: 'Portal notifications' });
    const originalId = within(region).getByRole('status').id;
    expect(region.parentElement).toBe(canvasElement.ownerDocument.body);
    await user.click(
      canvas.getByRole('button', { name: 'Use explicit portal' }),
    );
    const destination = canvas.getByRole('region', {
      name: 'Explicit portal destination',
    });
    const explicitRegion = within(destination).getByRole('region', {
      name: 'Portal notifications',
    });
    expect(explicitRegion.parentElement).toBe(destination);
    expect(within(explicitRegion).getByRole('status').id).toBe(originalId);
    await user.click(canvas.getByRole('button', { name: 'Disable portal' }));
    expect(body.queryByRole('status')).not.toBeInTheDocument();
    await user.click(
      canvas.getByRole('button', { name: 'Update last notification' }),
    );
    await user.click(
      canvas.getByRole('button', { name: 'Use default portal' }),
    );
    const restoredRegion = body.getByRole('region', {
      name: 'Portal notifications',
    });
    expect(restoredRegion.parentElement).toBe(canvasElement.ownerDocument.body);
    expect(within(restoredRegion).getByRole('status').id).toBe(originalId);
    expect(within(restoredRegion).getByRole('status')).toHaveTextContent(
      'Updated notification',
    );
  },
};

export const ScopedAndNullPortalTargets: Story = {
  render: () => <ToasterPortalExample isScoped />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const user = userEvent.setup();
    await user.click(canvas.getByRole('button', { name: 'Add notification' }));
    const region = body.getByRole('region', { name: 'Portal notifications' });
    const originalId = within(region).getByRole('status').id;
    expect(region.parentElement).toHaveClass('toast-lifecycle-portal-scope');
    expect(region.parentElement).toHaveClass('dark');
    expect(region).toHaveAttribute('dir', 'rtl');
    await user.click(canvas.getByRole('button', { name: 'Disable portal' }));
    expect(
      body.queryByRole('region', { name: 'Portal notifications' }),
    ).not.toBeInTheDocument();
    await user.click(
      canvas.getByRole('button', { name: 'Close last notification' }),
    );
    await user.click(
      canvas.getByRole('button', { name: 'Use default portal' }),
    );
    expect(body.queryByRole('status')).not.toBeInTheDocument();
    await user.click(canvas.getByRole('button', { name: 'Add notification' }));
    const restoredRegion = body.getByRole('region', {
      name: 'Portal notifications',
    });
    const replacement = within(restoredRegion).getByRole('status');
    expect(replacement.id).not.toBe(originalId);
    expect(restoredRegion.parentElement).toHaveClass(
      'toast-lifecycle-portal-scope',
    );
    expect(restoredRegion).toHaveAttribute('dir', 'rtl');
    await user.click(
      canvas.getByRole('button', { name: 'Use explicit portal' }),
    );
    const destination = canvas.getByRole('region', {
      name: 'Explicit portal destination',
    });
    expect(
      within(destination).getByRole('region', { name: 'Portal notifications' }),
    ).toHaveAttribute('dir', 'rtl');
    expect(within(destination).getByRole('status').id).toBe(replacement.id);
  },
};

export const SuspensePreservesProviderNotificationsAndRemainingTime: Story = {
  args: { duration: 3000 },
  render: (args) => (
    <ToasterProviderSuspenseExample
      duration={args.duration}
      onClose={args.onClose}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const user = userEvent.setup();
    await user.click(
      canvas.getByRole('button', { name: 'Add timed notification' }),
    );
    const original = within(
      body.getByRole('region', { name: 'Suspense lifecycle notifications' }),
    ).getByRole('status');
    const originalId = original.id;
    await wait(1600);
    await user.click(
      canvas.getByRole('button', { name: 'Suspend notification provider' }),
    );
    await waitFor(() => {
      expect(
        canvas.getByRole('note', { name: 'Provider suspension state' }),
      ).toHaveTextContent('Notification provider suspended');
      expect(original).not.toBeVisible();
    });
    await wait(3500);
    expect(body.queryByRole('status')).not.toBeInTheDocument();
    expect(args.onClose).not.toHaveBeenCalled();
    await user.click(
      canvas.getByRole('button', { name: 'Reveal notification provider' }),
    );
    const restored = await body.findByRole('status');
    expect(restored.id).toBe(originalId);
    expect(restored).toHaveTextContent('Lifecycle notification 1');
    expect(
      canvas.getByRole('note', { name: 'Last lifecycle notification ID' }),
    ).toHaveTextContent(originalId);
    await wait(400);
    expect(restored).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce(), {
      timeout: 1400,
    });
    await waitFor(() => expect(restored).not.toBeInTheDocument());
    expect(args.onClose).toHaveBeenCalledWith('Lifecycle notification 1');
    await user.click(
      canvas.getByRole('button', { name: 'Unmount notification provider' }),
    );
    await Promise.resolve();
    expect(body.queryByRole('status')).not.toBeInTheDocument();
    expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const StrictModePassiveEffectsCloseTheirOwnNotifications: Story = {
  parameters: { react: { rootOptions: { unstable_strictMode: true } } },
  render: (args) => (
    <ToasterProviderReplayExample>
      <ToasterProviderPassiveReplayEffect onClose={args.onClose} />
    </ToasterProviderReplayExample>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const user = userEvent.setup();
    await waitFor(() => {
      expect(body.getAllByRole('status')).toHaveLength(1);
      expect(args.onClose).toHaveBeenCalledOnce();
    });
    const notification = body.getByRole('status');
    const notificationId = notification.id;
    expect(notification).toHaveTextContent('Passive effect notification');
    expect(args.onClose).not.toHaveBeenNthCalledWith(1, notificationId);
    await user.click(
      canvas.getByRole('button', { name: 'Unmount notification provider' }),
    );
    await Promise.resolve();
    expect(notification).not.toBeInTheDocument();
    expect(body.queryByRole('status')).not.toBeInTheDocument();
    expect(args.onClose).toHaveBeenCalledTimes(2);
    expect(args.onClose).toHaveBeenNthCalledWith(2, notificationId);
  },
};

export const StrictModeLayoutEffectsCloseTheirOwnNotifications: Story = {
  parameters: { react: { rootOptions: { unstable_strictMode: true } } },
  render: (args) => (
    <ToasterProviderReplayExample>
      <ToasterProviderLayoutReplayEffect onClose={args.onClose} />
    </ToasterProviderReplayExample>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const user = userEvent.setup();
    await waitFor(() => {
      expect(body.getAllByRole('status')).toHaveLength(1);
      expect(args.onClose).toHaveBeenCalledOnce();
    });
    const notification = body.getByRole('status');
    const notificationId = notification.id;
    expect(notification).toHaveTextContent('Layout effect notification');
    expect(args.onClose).not.toHaveBeenNthCalledWith(1, notificationId);
    await user.click(
      canvas.getByRole('button', { name: 'Unmount notification provider' }),
    );
    await Promise.resolve();
    expect(notification).not.toBeInTheDocument();
    expect(body.queryByRole('status')).not.toBeInTheDocument();
    expect(args.onClose).toHaveBeenCalledTimes(2);
    expect(args.onClose).toHaveBeenNthCalledWith(2, notificationId);
  },
};
