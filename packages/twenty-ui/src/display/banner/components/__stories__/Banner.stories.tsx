import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import { IconX } from '@ui/display';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { themeCssVariables } from '@ui/theme-constants';
import { Button } from '../../../../input/button/components/Button/Button';
import { IconButton } from '../../../../input/button/components/IconButton';
import { Banner, type BannerColor, type BannerVariant } from '../Banner';

const StyledBannerContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: 8px;
  justify-content: center;
`;

const StyledContainer = styled.div`
  width: 100%;
`;

const StyledInvertedIconButton = styled(IconButton)`
  color: ${themeCssVariables.font.color.inverted} !important;
`;

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
    <StyledInvertedIconButton
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
  title: 'UI/Layout/Banner/Banner',
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
    <StyledContainer>
      {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
      <Banner {...args}>
        <StyledBannerContent>
          Sync lost with mailbox hello@twenty.com. Please reconnect for updates:
          <Button
            variant="secondary"
            accent={getButtonAccent(args.color)}
            title="Reconnect"
            size="small"
            inverted={args.variant === 'primary'}
          />
        </StyledBannerContent>
        <BannerCloseButton color={args.color} variant={args.variant} />
      </Banner>
    </StyledContainer>
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
      <StyledBannerContent>
        Sync lost with mailbox hello@twenty.com. Please reconnect for updates:
        <Button
          variant="secondary"
          accent={getButtonAccent(args.color)}
          title="Reconnect"
          size="small"
          inverted={args.variant === 'primary'}
        />
      </StyledBannerContent>
      <BannerCloseButton color={args.color} variant={args.variant} />
    </Banner>
  ),
  parameters: {
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
