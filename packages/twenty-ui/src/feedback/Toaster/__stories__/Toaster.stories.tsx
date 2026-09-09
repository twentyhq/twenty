import { type Meta, type StoryObj } from '@storybook/react-vite';
import { StrictMode, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ToastProvider } from '@ui/feedback/Toast/ToastProvider';
import { ComponentDecorator } from '@ui/testing';
import { ThemeProvider } from '@ui/theme-constants/ThemeProvider';

import { Toaster } from '../Toaster';
import {
  ToastControls,
  ToasterExample,
  type ToasterExampleProps,
} from './ToasterExample';

const meta: Meta<typeof ToasterExample> = {
  title: 'UI/Feedback/Toaster',
  component: ToasterExample,
  args: { onClose: fn() },
};

export default meta;
type Story = StoryObj<typeof ToasterExample>;

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
    await waitFor(() =>
      expect(
        getComputedStyle(toast.parentElement!.parentElement!).opacity,
      ).toBe('1'),
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
      <button type="button" onClick={() => setScreen('workspace')}>
        Enter workspace
      </button>
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
      within(region).getAllByRole('button', { name: 'Close' })[0],
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
      <button type="button" onClick={() => setIsAttached(true)}>
        Attach viewport
      </button>
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
    const [first, middle, last] = body.getAllByRole('status');
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
    await userEvent.click(add);
    await userEvent.click(add);
    await userEvent.click(add);
    const region = body.getByRole('region', { name: 'Notifications' });
    await waitFor(() =>
      expect(region.getAnimations({ subtree: true })).toHaveLength(0),
    );
    const [toast, secondToast, thirdToast] = body.getAllByRole('status');
    const id = toast.id;
    await userEvent.click(within(toast).getByRole('button', { name: 'Close' }));
    if (isMotionEnabled()) {
      expect(toast).toBeInTheDocument();
    }
    await userEvent.click(
      canvas.getByRole('button', { name: 'Restore last notification' }),
    );
    await waitFor(() =>
      expect(region.getAnimations({ subtree: true })).toHaveLength(0),
    );
    const restoredToasts = body.getAllByRole('status');
    expect(restoredToasts.map((notification) => notification.id)).toEqual([
      secondToast.id,
      thirdToast.id,
      id,
    ]);
    expect(restoredToasts[2]).toHaveTextContent('Restored notification');
    expect(restoredToasts[2]).toBeVisible();
    expect(args.onClose).toHaveBeenCalledOnce();
  },
};
