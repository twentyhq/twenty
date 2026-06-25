import { type Meta, type StoryObj } from '@storybook/react-vite';

import { IconX } from '@ui/icon';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { Button } from '@ui/input/Button/Button';
import { IconButton } from '@ui/input/IconButton/IconButton';
import {
  Banner,
  type BannerColor,
  type BannerVariant,
} from '@ui/feedback/Banner/Banner';

import styles from './Banner.stories.module.scss';

const getButtonAccent = (color?: BannerColor) =>
  color === 'danger' ? 'danger' : 'blue';

const BannerCloseButton = ({
  color,
  variant,
}: {
  color?: BannerColor;
  variant?: BannerVariant;
}) =>
  variant === 'primary' ? (
    <IconButton
      className={styles.invertedIconButton}
      Icon={IconX}
      size="small"
      variant="tertiary"
      ariaLabel="Close"
    />
  ) : (
    <IconButton
      Icon={IconX}
      size="small"
      variant="tertiary"
      accent={getButtonAccent(color)}
      ariaLabel="Close"
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
      {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
      <Banner {...args}>
        <div className={styles.bannerContent}>
          Sync lost with mailbox hello@twenty.com. Please reconnect for updates:
          <Button
            variant="secondary"
            accent={getButtonAccent(args.color)}
            title="Reconnect"
            size="small"
            inverted={args.variant === 'primary'}
          />
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
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <Banner {...args}>
      <div className={styles.bannerContent}>
        Sync lost with mailbox hello@twenty.com. Please reconnect for updates:
        <Button
          variant="secondary"
          accent={getButtonAccent(args.color)}
          title="Reconnect"
          size="small"
          inverted={args.variant === 'primary'}
        />
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
