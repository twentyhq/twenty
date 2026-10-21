import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';

import { IconInfoCircle } from '@ui/icon';
import { Banner } from '@ui/primitives/feedback/Banner/Banner';
import { type BannerColor } from '@ui/primitives/feedback/Banner/types/BannerColor';
import { type BannerStatus } from '@ui/primitives/feedback/Banner/types/BannerStatus';
import { type BannerVariant } from '@ui/primitives/feedback/Banner/types/BannerVariant';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

const meta: Meta<typeof Banner> = {
  title: 'UI/Feedback/Banner',
  component: Banner,
  argTypes: {
    status: {
      control: 'select',
      options: [
        'neutral',
        'info',
        'success',
        'warning',
        'error',
      ] satisfies BannerStatus[],
    },
    color: {
      control: 'select',
      options: [
        'gray',
        'blue',
        'green',
        'orange',
        'red',
      ] satisfies BannerColor[],
    },
    variant: {
      control: 'select',
      options: ['solid', 'soft'] satisfies BannerVariant[],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Banner>;

export const Display: Story = {
  args: {
    status: 'info',
    variant: 'solid',
    children:
      'Contact sync is temporarily paused. Your saved records remain available.',
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof Banner> = {
  args: {
    children: 'Your account needs attention.',
    role: 'status',
    action: <Banner.Action>Review details</Banner.Action>,
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'variant',
          values: ['solid', 'soft'] satisfies BannerVariant[],
          props: (variant: BannerVariant) => ({ variant }),
        },
        {
          name: 'status',
          values: [
            'neutral',
            'info',
            'success',
            'warning',
            'error',
          ] satisfies BannerStatus[],
          props: (status: BannerStatus) => ({ status }),
        },
      ],
      options: { elementContainer: { width: 240 } },
    },
  },
  decorators: [CatalogDecorator],
};

export const CatalogContrast: Story = {
  ...Catalog,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const banner of canvas.getAllByRole('status')) {
      const action = within(banner).getByRole('button', {
        name: 'Review details',
      });

      await expect(getComputedStyle(action).color).toBe(
        getComputedStyle(banner).color,
      );
    }
  },
};

export const SoftNeutral: Story = {
  tags: ['!autodocs'],
  args: {
    status: 'neutral',
    variant: 'soft',
    children: 'Contacts are syncing in the background.',
    icon: <IconInfoCircle aria-hidden="true" />,
    action: <Banner.Action>View progress</Banner.Action>,
  },
  parameters: { container: { width: 600 } },
  decorators: [ComponentDecorator],
};

export const SoftNeutralDark: Story = {
  ...SoftNeutral,
  globals: { colorScheme: 'dark' },
};

export const IndependentAppearance: Story = {
  args: {
    status: 'error',
    color: 'blue',
    variant: 'soft',
    children: 'Sync could not finish.',
    icon: <IconInfoCircle aria-hidden="true" />,
    action: <Banner.Action>Retry sync</Banner.Action>,
    role: 'status',
    'aria-live': 'polite',
    'aria-label': 'Sync result',
    className: 'custom-banner',
    style: { marginTop: 7 },
    render: <section data-composed="true" />,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const banner = canvas.getByRole('status', { name: 'Sync result' });
    await expect(banner.tagName).toBe('SECTION');
    await expect(banner).toHaveAttribute('data-status', 'error');
    await expect(banner).toHaveAttribute('data-color', 'blue');
    await expect(banner).toHaveAttribute('data-variant', 'soft');
    await expect(banner).toHaveAttribute('aria-live', 'polite');
    await expect(banner).toHaveClass('custom-banner');
    await expect(banner).toHaveStyle({ marginTop: '7px' });
    const action = canvas.getByRole('button', { name: 'Retry sync' });

    await expect(action).toBeVisible();
    await expect(getComputedStyle(action).color).toBe(
      getComputedStyle(banner).color,
    );
  },
};

export const Dismissible: Story = {
  args: {
    children: 'Contacts are syncing in the background.',
    onDismiss: fn(),
    role: 'status',
    action: <Banner.Action>View progress</Banner.Action>,
  },
  parameters: { container: { width: 400 } },
  decorators: [ComponentDecorator],
};

export const DismissalInteractions: Story = {
  ...Dismissible,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const banner = canvas.getByRole('status');
    const close = canvas.getByRole('button', { name: 'Close' });
    const action = canvas.getByRole('button', { name: 'View progress' });

    await expect(close).toHaveAttribute('type', 'button');
    await expect(close.getBoundingClientRect().width).toBe(24);
    await expect(close.getBoundingClientRect().height).toBe(24);
    await expect(action.getBoundingClientRect().right).toBeLessThan(
      close.getBoundingClientRect().left,
    );
    await expect(getComputedStyle(close).color).toBe(
      getComputedStyle(banner).color,
    );
    close.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onDismiss).toHaveBeenCalledOnce();
    await expect(banner).toBeVisible();
  },
};

export const DismissibleRtl: Story = {
  ...Dismissible,
  args: {
    ...Dismissible.args,
    closeLabel: 'Dismiss sync message',
    dir: 'rtl',
    onDismiss: fn(),
  },
  decorators: [
    ComponentDecorator,
    (Story) => (
      <DirectionProvider direction="rtl">
        <Story />
      </DirectionProvider>
    ),
  ],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Dismiss sync message' });
    const action = canvas.getByRole('button', { name: 'View progress' });

    await expect(close.getBoundingClientRect().right).toBeLessThan(
      action.getBoundingClientRect().left,
    );
    await userEvent.click(close);
    await expect(args.onDismiss).toHaveBeenCalledOnce();
  },
};

export const ControlledDismissal: Story = {
  decorators: [ComponentDecorator],
  render: function ControlledDismissalExample() {
    const [isVisible, setIsVisible] = useState(true);

    return (
      <form onSubmit={(event) => event.preventDefault()}>
        {isVisible ? (
          <Banner
            onDismiss={() => setIsVisible(false)}
            closeLabel="Dismiss sync message"
            role="status"
          >
            Contacts are syncing in the background.
          </Banner>
        ) : (
          <Button onClick={() => setIsVisible(true)}>Show sync message</Button>
        )}
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Dismiss sync message' }),
    );
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show sync message' }),
    );
    await expect(canvas.getByRole('status')).toBeVisible();
  },
};
