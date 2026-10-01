import { type Meta, type StoryObj } from '@storybook/react-vite';

import { IconX } from '@ui/icon';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { Button } from '@ui/primitives/input/Button/Button';
import {
  Banner,
  type BannerColor,
  type BannerVariant,
} from '@ui/primitives/feedback/Banner/Banner';

import styles from './Banner.stories.module.scss';

const getButtonColor = (color?: BannerColor) =>
  color === 'danger' ? 'danger' : 'accent';

const BannerCloseButton = ({
  color,
  variant,
}: {
  color?: BannerColor;
  variant?: BannerVariant;
}) =>
  variant === 'primary' ? (
    <Button
      className={styles.invertedIconButton}
      size="sm"
      variant="ghost"
      aria-label="Close"
      startIcon={<IconX />}
    />
  ) : (
    <Button
      size="sm"
      variant="ghost"
      color={getButtonColor(color)}
      aria-label="Close"
      startIcon={<IconX />}
    />
  );

const meta: Meta<typeof Banner> = {
  title: 'UI/Feedback/Banner',
  component: Banner,
  argTypes: {
    color: {
      control: 'select',
      options: ['blue', 'danger'] satisfies BannerColor[],
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary'] satisfies BannerVariant[],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Banner>;

export const Default: Story = {
  args: {
    color: 'blue',
    variant: 'primary',
  },
  render: (args) => (
    <div className={styles.container}>
      <Banner {...args}>
        <div className={styles.bannerContent}>
          Sync lost with mailbox hello@twenty.com. Please reconnect for updates:
          <Button
            size="sm"
            variant="outline"
            color={
              args.variant === 'primary'
                ? 'neutral'
                : getButtonColor(args.color)
            }
            className={
              args.variant === 'primary' ? styles.invertedButton : undefined
            }
          >
            {'Reconnect'}
          </Button>
        </div>
        <BannerCloseButton color={args.color} variant={args.variant} />
      </Banner>
    </div>
  ),
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof Banner> = {
  args: {},
  argTypes: {
    color: { control: false },
    variant: { control: false },
  },
  render: (args) => (
    <Banner {...args}>
      <div className={styles.bannerContent}>
        Sync lost with mailbox hello@twenty.com. Please reconnect for updates:
        <Button
          size="sm"
          variant="outline"
          color={
            args.variant === 'primary' ? 'neutral' : getButtonColor(args.color)
          }
          className={
            args.variant === 'primary' ? styles.invertedButton : undefined
          }
        >
          {'Reconnect'}
        </Button>
      </div>
      <BannerCloseButton color={args.color} variant={args.variant} />
    </Banner>
  ),
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'variant',
          values: ['primary', 'secondary'] satisfies BannerVariant[],
          props: (variant: BannerVariant) => ({ variant }),
        },
        {
          name: 'color',
          values: ['blue', 'danger'] satisfies BannerColor[],
          props: (color: BannerColor) => ({ color }),
        },
      ],
      options: {
        elementContainer: {
          width: 700,
        },
      },
    },
  },
  decorators: [CatalogDecorator],
};
