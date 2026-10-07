import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { IconInfoCircle, IconX } from '@ui/icon';
import { Banner } from '@ui/primitives/feedback/Banner/Banner';
import { type BannerColor } from '@ui/primitives/feedback/Banner/types/BannerColor';
import { type BannerStatus } from '@ui/primitives/feedback/Banner/types/BannerStatus';
import { type BannerVariant } from '@ui/primitives/feedback/Banner/types/BannerVariant';
import { Button } from '@ui/primitives/input/Button/Button';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import styles from './Banner.stories.module.scss';

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

export const Default: Story = {
  args: { status: 'info', variant: 'solid' },
  render: (args) => (
    <Banner {...args}>
      <div className={styles.bannerContent}>
        Sync lost with mailbox hello@twenty.com. Please reconnect for updates:
        <Banner.Action>Reconnect</Banner.Action>
      </div>
      <Button
        className={styles.closeButton}
        size="sm"
        variant="ghost"
        aria-label="Close"
        startIcon={<IconX />}
      />
    </Banner>
  ),
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
      options: { elementContainer: { width: 700 } },
    },
  },
  decorators: [CatalogDecorator],
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
