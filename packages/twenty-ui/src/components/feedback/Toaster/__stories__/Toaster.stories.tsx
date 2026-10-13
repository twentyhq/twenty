import { type Meta, type StoryObj } from '@storybook/react-vite';
import { StrictMode, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ToastProvider } from '@ui/components/feedback/Toast/ToastProvider';
import { Button } from '@ui/primitives/input/Button/Button';
import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { ComponentDecorator } from '@ui/testing';
import { ThemeProvider } from '@ui/theme/ThemeProvider';

import { Toaster } from '../Toaster';
import { ToastControls } from './ToastControls';
import { ToasterExample } from './ToasterExample';
import { type ToasterExampleProps } from './ToasterExampleProps';
import { ToasterUpdateExample } from './ToasterUpdateExample';
import { type ToasterUpdateExampleProps } from './ToasterUpdateExampleProps';

const meta: Meta<ToasterUpdateExampleProps> = {
  id: 'ui-feedback-toaster',
  title: 'UI/Components/Feedback/Toaster',
  component: ToasterExample,
  args: { onClose: fn() },
};

export default meta;
type Story = StoryObj<ToasterUpdateExampleProps>;

const isMotionEnabled = () =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const Default: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 400, height: 200 } },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Add notification',
      }),
    );
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole('status')).toBeVisible());
    expect(body.getByRole('status')).toHaveTextContent('Notification 1');
  },
};

export const QueueOverflow: Story = {
  ...Default,
  play: async ({ canvasElement, args }) => {
    const add = within(canvasElement).getByRole('button', {
      name: 'Add notification',
    });
    const limit = args.limit ?? 3;
    for (let count = 0; count <= limit; count++) {
      await userEvent.click(add);
    }
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() =>
      expect(body.queryByText('Notification 1')).not.toBeInTheDocument(),
    );
    const region = body.getByRole('region', { name: 'Notifications' });
    await waitFor(() =>
      expect(region.getAnimations({ subtree: true })).toHaveLength(0),
    );
    expect(body.getAllByRole('status')).toHaveLength(limit);
    expect(body.getByText(`Notification ${limit + 1}`)).toBeVisible();
    expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const CustomLimit: Story = {
  ...QueueOverflow,
  args: { limit: 1 },
};

export const Deduplication: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const add = canvas.getByRole('button', { name: 'Add duplicate' });
    await userEvent.click(add);
    const id = canvas.getByLabelText('Last notification ID').textContent;
    await userEvent.click(add);
    expect(canvas.getByLabelText('Last notification ID')).toHaveTextContent(
      id!,
    );
    const body = within(canvasElement.ownerDocument.body);
    expect(body.getAllByRole('status')).toHaveLength(1);
    await waitFor(() => expect(body.getByText('Already saved')).toBeVisible());
  },
};

export const Dismissal: Story = {
  ...Default,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add notification' }),
    );
    const toast = body.getByRole('status');
    const region = body.getByRole('region', { name: 'Notifications' });
    await waitFor(() =>
      expect(region.getAnimations({ subtree: true })).toHaveLength(0),
    );
    await userEvent.click(body.getByRole('button', { name: 'Close' }));
    if (isMotionEnabled()) {
      expect(toast).toBeInTheDocument();
    }
    expect(args.onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(toast).not.toBeInTheDocument());
    expect(args.onClose).toHaveBeenCalledOnce();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Close last notification' }),
    );
    expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const CloseAll: Story = {
  ...Default,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const add = canvas.getByRole('button', {
      name: 'Add notification',
    });
    await userEvent.click(add);
    await userEvent.click(add);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Close all notifications' }),
    );
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryAllByRole('status'),
      ).toHaveLength(0),
    );
    expect(args.onClose).toHaveBeenCalledTimes(2);
  },
};

export const Countdown: Story = {
  ...Default,
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Add timed notification',
      }),
    );
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce(), {
      timeout: 3000,
    });
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole('status'),
      ).not.toBeInTheDocument(),
    );
  },
};

export const StrictModeAddition: Story = {
  ...Default,
  render: (args) => (
    <StrictMode>
      <ToasterExample {...args} />
    </StrictMode>
  ),
};

const RemountingToaster = ({ onClose }: ToasterExampleProps) => {
  const [screen, setScreen] = useState('authentication');
  return (
    <ToastProvider>
      <ToastControls onClose={onClose} />
      <Button type="button" onClick={() => setScreen('workspace')}>
        Enter workspace
      </Button>
      <Toaster key={screen} aria-label={`${screen} notifications`} />
    </ToastProvider>
  );
};

export const RendererRemount: Story = {
  ...Default,
  render: (args) => <RemountingToaster {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add notification' }),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Enter workspace' }),
    );
    const body = within(canvasElement.ownerDocument.body);
    const region = body.getByRole('region', {
      name: 'workspace notifications',
    });
    await waitFor(() =>
      expect(within(region).getByText('Notification 1')).toBeVisible(),
    );
    expect(
      body.queryByRole('region', { name: 'authentication notifications' }),
    ).not.toBeInTheDocument();
  },
};

export const RendererRemountDuringExit: Story = {
  ...RendererRemount,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const add = canvas.getByRole('button', { name: 'Add notification' });
    await userEvent.click(add);
    await userEvent.click(add);
    const region = body.getByRole('region', {
      name: 'authentication notifications',
    });
    await waitFor(() =>
      expect(region.getAnimations({ subtree: true })).toHaveLength(0),
    );
    await userEvent.click(
      within(region).getAllByRole('button', { name: 'Close' })[0]!,
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Enter workspace' }),
    );

    const workspaceRegion = body.getByRole('region', {
      name: 'workspace notifications',
    });
    await waitFor(() => {
      expect(body.queryByText('Notification 1')).not.toBeInTheDocument();
      expect(within(workspaceRegion).getByText('Notification 2')).toBeVisible();
    });
    expect(args.onClose).toHaveBeenCalledOnce();
  },
};

const DeferredToaster = () => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [isAttached, setIsAttached] = useState(false);
  return (
    <ToastProvider>
      <ToastControls />
      <Button type="button" onClick={() => setIsAttached(true)}>
        Attach viewport
      </Button>
      {isAttached && <div ref={setContainer} data-testid="toast-container" />}
      <Toaster container={container} />
    </ToastProvider>
  );
};

export const DeferredContainer: Story = {
  ...Default,
  render: () => <DeferredToaster />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add notification' }),
    );
    expect(
      within(canvasElement.ownerDocument.body).queryByRole('region'),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Attach viewport' }),
    );
    await waitFor(() =>
      expect(
        within(canvas.getByTestId('toast-container')).getByText(
          'Notification 1',
        ),
      ).toBeVisible(),
    );
  },
};

export const DismissBeforeContainer: Story = {
  ...DeferredContainer,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const add = canvas.getByRole('button', { name: 'Add notification' });
    await userEvent.click(add);
    await userEvent.click(add);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Close last notification' }),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Attach viewport' }),
    );

    const container = within(canvas.getByTestId('toast-container'));
    await waitFor(() => expect(container.getByRole('status')).toBeVisible());
    expect(container.getByRole('status')).toHaveTextContent('Notification 1');
    expect(container.queryByText('Notification 2')).not.toBeInTheDocument();
  },
};

export const ScopedTheme: Story = {
  ...Default,
  render: (args) => (
    <ThemeProvider colorScheme="dark" applyToRoot={false}>
      <ToasterExample {...args} />
    </ThemeProvider>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Add notification',
      }),
    );
    const toast = within(canvasElement.ownerDocument.body).getByRole('status');
    expect(toast.closest('.dark')).not.toBeNull();
  },
};

export const Dark: Story = {
  ...Default,
  globals: { colorScheme: 'dark' },
};

export const ProviderIsolation: Story = {
  ...Default,
  render: () => (
    <>
      <section aria-label="First source">
        <ToastProvider>
          <ToastControls />
          <Toaster aria-label="First notifications" style={{ bottom: 200 }} />
        </ToastProvider>
      </section>
      <section aria-label="Second source">
        <ToastProvider>
          <ToastControls />
          <Toaster aria-label="Second notifications" />
        </ToastProvider>
      </section>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = within(canvas.getByRole('region', { name: 'First source' }));
    const second = within(
      canvas.getByRole('region', { name: 'Second source' }),
    );
    await userEvent.click(
      first.getByRole('button', { name: 'Add notification' }),
    );
    await userEvent.click(
      second.getByRole('button', { name: 'Add notification' }),
    );
    const body = within(canvasElement.ownerDocument.body);
    const firstToaster = within(
      body.getByRole('region', { name: 'First notifications' }),
    );
    const secondToaster = within(
      body.getByRole('region', { name: 'Second notifications' }),
    );
    await waitFor(() => {
      expect(firstToaster.getByRole('status')).toBeVisible();
      expect(secondToaster.getByRole('status')).toBeVisible();
    });
    await userEvent.click(
      first.getByRole('button', { name: 'Update last notification' }),
    );
    expect(firstToaster.getByRole('status')).toHaveTextContent(
      'Updated notification',
    );
    expect(secondToaster.getByRole('status')).toHaveTextContent(
      'Notification 1',
    );
    await userEvent.click(
      first.getByRole('button', { name: 'Close all notifications' }),
    );
    await waitFor(() =>
      expect(firstToaster.queryByRole('status')).not.toBeInTheDocument(),
    );
    expect(secondToaster.getByRole('status')).toBeVisible();
  },
};

export const StackReflow: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const add = canvas.getByRole('button', { name: 'Add notification' });
    await userEvent.click(add);
    await userEvent.click(add);
    await userEvent.click(add);
    const region = body.getByRole('region', { name: 'Notifications' });
    await waitFor(() =>
      expect(region.getAnimations({ subtree: true })).toHaveLength(0),
    );
    const statuses = body.getAllByRole('status');
    expect(statuses).toHaveLength(3);
    const first = statuses[0]!;
    const middle = statuses[1]!;
    const last = statuses[2]!;
    const firstTop = first.getBoundingClientRect().top;
    const gap = middle.getBoundingClientRect().top - firstTop;
    const isTopAnchored = getComputedStyle(region).top === '0px';
    const movingToast = isTopAnchored ? last : first;
    const anchoredToast = isTopAnchored ? first : last;
    const movingTop = movingToast.getBoundingClientRect().top;
    const anchoredTop = anchoredToast.getBoundingClientRect().top;
    const direction = isTopAnchored ? -1 : 1;

    await userEvent.click(
      within(middle).getByRole('button', { name: 'Close' }),
    );
    if (isMotionEnabled()) {
      expect(middle).toBeInTheDocument();
      await waitFor(() => {
        const distance =
          (movingToast.getBoundingClientRect().top - movingTop) * direction;
        expect(distance).toBeGreaterThan(1);
        expect(distance).toBeLessThan(gap - 1);
      });
    }
    await waitFor(() => expect(middle).not.toBeInTheDocument());
    expect(movingToast.getBoundingClientRect().top).toBeCloseTo(
      movingTop + gap * direction,
      0,
    );
    expect(anchoredToast.getBoundingClientRect().top).toBeCloseTo(
      anchoredTop,
      0,
    );
  },
};

export const ReopenDuringExit: Story = {
  ...Default,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const add = canvas.getByRole('button', { name: 'Add notification' });
    const addDuplicate = canvas.getByRole('button', { name: 'Add duplicate' });
    await userEvent.click(addDuplicate);
    await userEvent.click(add);
    await userEvent.click(add);
    const region = body.getByRole('region', { name: 'Notifications' });
    await waitFor(() =>
      expect(region.getAnimations({ subtree: true })).toHaveLength(0),
    );
    const statuses = body.getAllByRole('status');
    expect(statuses).toHaveLength(3);
    const toast = statuses[0]!;
    const secondToast = statuses[1]!;
    const thirdToast = statuses[2]!;
    const id = toast.id;
    await userEvent.click(within(toast).getByRole('button', { name: 'Close' }));
    if (isMotionEnabled()) {
      expect(toast).toBeInTheDocument();
    }
    await userEvent.click(addDuplicate);
    await waitFor(() =>
      expect(region.getAnimations({ subtree: true })).toHaveLength(0),
    );
    const restoredToasts = body.getAllByRole('status');
    expect(
      restoredToasts.slice(0, 2).map((notification) => notification.id),
    ).toEqual([secondToast.id, thirdToast.id]);
    expect(toast).not.toBeInTheDocument();
    expect(restoredToasts[2]?.id).not.toBe(id);
    expect(restoredToasts[2]).toHaveTextContent('Already saved');
    expect(restoredToasts[2]).toBeVisible();
    expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const UpdatesInPlace: Story = {
  ...Default,
  args: { onAction: fn(), onCancel: fn(), onClose: fn() },
  render: (args) => <ToasterUpdateExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add editable notification' }),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add following notification' }),
    );
    const notifications = body.getAllByRole('status');
    const first = notifications[0]!;
    const following = notifications[1]!;
    const id = canvas.getByLabelText('Editable notification ID').textContent;
    expect(first.id).toBe(id);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Update content' }),
    );
    expect(body.getAllByRole('status')).toHaveLength(2);
    expect(body.getAllByRole('status')[0]).toBe(first);
    expect(body.getAllByRole('status')[1]).toBe(following);
    expect(first).toHaveTextContent('Draft update 1');
    expect(first).toHaveTextContent('Editing the draft');
    expect(
      within(first).getByRole('button', { name: 'Open draft' }),
    ).toBeVisible();
    expect(
      within(first).getByRole('progressbar', { hidden: true }),
    ).toHaveAttribute('aria-valuenow', '25');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Update content' }),
    );
    expect(body.getAllByRole('status')).toHaveLength(2);
    expect(body.getAllByRole('status')[0]).toBe(first);
    expect(body.getAllByRole('status')[1]).toBe(following);
    expect(first.id).toBe(id);
    expect(first).toHaveTextContent('Draft update 2');
    await userEvent.click(
      within(first).getByRole('button', { name: 'Open draft' }),
    );
    await userEvent.click(
      within(first).getByRole('button', { name: 'Cancel draft' }),
    );
    expect(args.onAction).toHaveBeenCalledOnce();
    expect(args.onCancel).toHaveBeenCalledOnce();
    expect(args.onClose).not.toHaveBeenCalled();
  },
};

export const UpdatesDocumentation: Story = {
  decorators: Default.decorators,
  parameters: Default.parameters,
  render: (args) => <ToasterUpdateExample {...args} />,
};

export const UpdatedActions: Story = {
  ...UpdatesInPlace,
  args: {
    onAction: fn(),
    onCancel: fn(),
    onClose: fn(),
    onUpdatedAction: fn(),
    onUpdatedCancel: fn(),
    onUpdatedClose: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add editable notification' }),
    );
    const toast = body.getByRole('status');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Update actions' }),
    );
    expect(body.getByRole('status')).toBe(toast);
    expect(toast).toHaveTextContent('Saved notification');
    expect(toast).toHaveTextContent('Synced with the workspace');
    await waitFor(() =>
      expect(
        within(toast).getByLabelText('Saved notification icon'),
      ).toBeVisible(),
    );
    expect(
      within(toast).getByRole('progressbar', { hidden: true }),
    ).toHaveAttribute('aria-valuenow', '100');
    expect(
      within(toast).queryByRole('button', { name: 'Open draft' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      within(toast).getByRole('button', { name: 'Open saved record' }),
    );
    await userEvent.click(
      within(toast).getByRole('button', { name: 'Revert save' }),
    );
    await userEvent.click(
      within(toast).getByRole('button', { name: 'Dismiss saved record' }),
    );
    expect(args.onUpdatedAction).toHaveBeenCalledOnce();
    expect(args.onUpdatedCancel).toHaveBeenCalledOnce();
    expect(args.onUpdatedClose).toHaveBeenCalledOnce();
    expect(args.onAction).not.toHaveBeenCalled();
    expect(args.onCancel).not.toHaveBeenCalled();
    expect(args.onClose).not.toHaveBeenCalled();
    await waitFor(() => expect(toast).not.toBeInTheDocument());
  },
};

export const ClearUpdatedContent: Story = {
  ...UpdatedActions,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add editable notification' }),
    );
    const toast = body.getByRole('status');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Update actions' }),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear optional content' }),
    );
    expect(body.getByRole('status')).toBe(toast);
    expect(toast).toHaveTextContent('Saved notification');
    expect(
      within(toast).queryByText('Synced with the workspace'),
    ).not.toBeInTheDocument();
    expect(
      within(toast).queryByLabelText('Saved notification icon'),
    ).not.toBeInTheDocument();
    expect(
      within(toast).queryByLabelText('Default feedback icon'),
    ).not.toBeInTheDocument();
    expect(
      within(toast).queryByRole('button', { name: 'Open saved record' }),
    ).not.toBeInTheDocument();
    expect(
      within(toast).queryByRole('button', { name: 'Revert save' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      within(toast).getByRole('button', { name: 'Dismiss saved record' }),
    );
    expect(args.onUpdatedClose).not.toHaveBeenCalled();
    expect(args.onClose).not.toHaveBeenCalled();
    await waitFor(() => expect(toast).not.toBeInTheDocument());
  },
};

export const ResetDefaults: Story = {
  ...UpdatedActions,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add editable notification' }),
    );
    const toast = body.getByRole('status');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Update actions' }),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear cancel label' }),
    );
    expect(
      within(toast).queryByRole('button', { name: 'Revert save' }),
    ).not.toBeInTheDocument();
    expect(args.onUpdatedCancel).not.toHaveBeenCalled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear optional content' }),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Restore defaults' }),
    );
    expect(body.getByRole('status')).toBe(toast);
    expect(toast).toHaveTextContent('Saved notification');
    expect(within(toast).getByLabelText('Default feedback icon')).toBeVisible();
    expect(within(toast).getByRole('button', { name: 'Close' })).toBeVisible();
    await userEvent.click(
      within(toast).getByRole('button', { name: 'Cancel' }),
    );
    expect(args.onUpdatedCancel).toHaveBeenCalledOnce();
    expect(args.onCancel).not.toHaveBeenCalled();
  },
};

export const StaleUpdates: Story = {
  ...UpdatesInPlace,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const unknownUpdate = canvas.getByRole('button', {
      name: 'Update unknown notification',
    });
    await userEvent.click(unknownUpdate);
    expect(body.queryByRole('status')).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add editable notification' }),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add following notification' }),
    );
    const toast = body.getAllByRole('status')[0]!;
    const following = body.getAllByRole('status')[1]!;
    const region = body.getByRole('region', { name: 'Notifications' });
    await waitFor(() =>
      expect(region.getAnimations({ subtree: true })).toHaveLength(0),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Dismiss and update notification' }),
    );
    expect(toast).toHaveTextContent('Draft notification');
    expect(args.onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(toast).not.toBeInTheDocument());
    await userEvent.click(
      canvas.getByRole('button', { name: 'Update dismissed notification' }),
    );
    await userEvent.click(unknownUpdate);
    expect(body.getAllByRole('status')).toHaveLength(1);
    expect(body.getByRole('status')).toBe(following);
    expect(
      body.queryByText('Dismissed notification updated'),
    ).not.toBeInTheDocument();
    expect(body.queryByText('Unexpected notification')).not.toBeInTheDocument();
    expect(args.onClose).toHaveBeenCalledOnce();
  },
};

const nativeToasterRef = fn();
const nativeToasterFocus = fn();
const nativeNotificationFocus = fn();

export const NativeComposition: Story = {
  ...Default,
  render: (args) => (
    <ThemeProvider colorScheme="dark" applyToRoot={false}>
      <DirectionProvider direction="rtl">
        <ToastProvider>
          <ToastControls onClose={args.onClose} />
          <Toaster
            aria-label="Composed notifications"
            data-native-viewport
            ref={nativeToasterRef}
            render={<section onFocus={nativeToasterFocus} />}
            getToastProps={() => ({
              render: (
                <section
                  data-native-notification
                  onFocus={nativeNotificationFocus}
                />
              ),
              tabIndex: 0,
            })}
          />
        </ToastProvider>
      </DirectionProvider>
    </ThemeProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add notification' }),
    );
    const region = body.getByRole('region', { name: 'Composed notifications' });
    const toast = within(region).getByRole('status');
    expect(region.tagName).toBe('SECTION');
    expect(region).toHaveAttribute('data-native-viewport');
    expect(region).toHaveAttribute('dir', 'rtl');
    expect(nativeToasterRef).toHaveBeenCalledWith(region);
    expect(toast.tagName).toBe('SECTION');
    expect(toast).toHaveAttribute('data-native-notification');
    expect(toast).toHaveAttribute('tabindex', '0');
    expect(toast.closest('.dark')).not.toBeNull();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Update last notification' }),
    );
    expect(within(region).getByRole('status')).toBe(toast);
    expect(toast).toHaveTextContent('Updated notification');
    await userEvent.click(within(toast).getByText('Updated notification'));
    expect(nativeNotificationFocus).toHaveBeenCalledOnce();
    expect(nativeToasterFocus).toHaveBeenCalledOnce();
  },
};
