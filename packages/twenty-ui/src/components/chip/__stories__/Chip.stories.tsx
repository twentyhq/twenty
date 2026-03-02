import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconUser, IconX } from '@ui/display';
import { Avatar } from '@ui/display/avatar/components/Avatar';

import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Chip, ChipAccent, ChipSize, ChipVariant } from '../Chip';

const meta: Meta<typeof Chip> = {
  title: 'UI/Components/Chip/Chip',
  component: Chip,
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: {
    label: 'Chip test',
    size: ChipSize.Small,
    variant: ChipVariant.Highlighted,
    accent: ChipAccent.TextPrimary,
    disabled: false,
    clickable: true,
    maxWidth: 200,
  },
  decorators: [ComponentDecorator],
};

export const WithLeftAvatar: Story = {
  args: {
    label: 'John Doe',
    clickable: true,
    variant: ChipVariant.Regular,
    leftComponent: (
      <Avatar
        placeholder="JD"
        placeholderColorSeed="John Doe"
        size="sm"
        type="rounded"
      />
    ),
  },
  decorators: [ComponentDecorator],
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Company',
    clickable: true,
    variant: ChipVariant.Regular,
    leftComponent: <IconUser size={14} />,
  },
  decorators: [ComponentDecorator],
};

export const EmptyLabel: Story = {
  args: {
    label: '',
    clickable: true,
    variant: ChipVariant.Regular,
    leftComponent: (
      <Avatar placeholder="?" placeholderColorSeed="empty" size="sm" />
    ),
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof Chip> = {
  args: { clickable: true, label: 'Hello' },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    accent: { control: false },
    disabled: { control: false },
    className: { control: false },
    rightComponent: { control: false },
    leftComponent: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.active'] },
    catalog: {
      dimensions: [
        {
          name: 'variants',
          values: Object.values(ChipVariant),
          props: (variant: ChipVariant) => ({ variant }),
        },
        {
          name: 'sizes',
          values: Object.values(ChipSize),
          props: (size: ChipSize) => ({ size }),
        },
        {
          name: 'states',
          values: ['default', 'hover', 'active', 'disabled'],
          props: (state: string) => {
            switch (state) {
              case 'hover':
              case 'active':
                return { className: state };
              case 'disabled':
                return { disabled: true };
              default:
                return {};
            }
          },
        },
        {
          name: 'accents',
          values: Object.values(ChipAccent),
          props: (accent: ChipAccent) => ({ accent }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};

export const WithAvatarCatalog: CatalogStory<Story, typeof Chip> = {
  args: {
    clickable: true,
    label: 'John Doe',
    leftComponent: (
      <Avatar
        placeholder="JD"
        placeholderColorSeed="John Doe"
        size="sm"
        type="rounded"
      />
    ),
  },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    accent: { control: false },
    disabled: { control: false },
    className: { control: false },
    rightComponent: { control: false },
    leftComponent: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.active'] },
    catalog: {
      dimensions: [
        {
          name: 'variants',
          values: Object.values(ChipVariant),
          props: (variant: ChipVariant) => ({ variant }),
        },
        {
          name: 'sizes',
          values: Object.values(ChipSize),
          props: (size: ChipSize) => ({ size }),
        },
        {
          name: 'states',
          values: ['default', 'hover', 'active', 'disabled'],
          props: (state: string) => {
            switch (state) {
              case 'hover':
              case 'active':
                return { className: state };
              case 'disabled':
                return { disabled: true };
              default:
                return {};
            }
          },
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};

export const WithRightComponentDivider: Story = {
  args: {
    label: 'document.pdf',
    variant: ChipVariant.Static,
    clickable: false,
    leftComponent: (
      <Avatar
        placeholder="D"
        placeholderColorSeed="document"
        size="sm"
        type="squared"
      />
    ),
    rightComponent: <IconX size={14} />,
    rightComponentDivider: true,
  },
  decorators: [ComponentDecorator],
};
