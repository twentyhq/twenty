import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconUser, IconX } from '@ui/display';
import { Avatar } from '@ui/display/avatar/components/Avatar';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { MemoryRouter } from 'react-router-dom';

import { ChipAccent, ChipSize, ChipVariant } from '../Chip';
import { LinkChip } from '../LinkChip';

const meta: Meta<typeof LinkChip> = {
  title: 'UI/Components/Chip/LinkChip',
  component: LinkChip,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LinkChip>;

export const Default: Story = {
  args: {
    label: 'Link Chip',
    to: '/example',
    size: ChipSize.Small,
    variant: ChipVariant.Regular,
    accent: ChipAccent.TextPrimary,
  },
  decorators: [ComponentDecorator],
};

export const WithAvatar: Story = {
  args: {
    label: 'John Doe',
    to: '/users/john-doe',
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

export const WithIcon: Story = {
  args: {
    label: 'Company',
    to: '/companies/1',
    variant: ChipVariant.Regular,
    leftComponent: <IconUser size={14} />,
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof LinkChip> = {
  args: { label: 'Link Chip', to: '/example' },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    accent: { control: false },
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
          values: ['default', 'hover', 'active'],
          props: (state: string) => {
            switch (state) {
              case 'hover':
              case 'active':
                return { className: state };
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

export const WithAvatarCatalog: CatalogStory<Story, typeof LinkChip> = {
  args: {
    label: 'John Doe',
    to: '/users/john-doe',
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
          values: ['default', 'hover', 'active'],
          props: (state: string) => {
            switch (state) {
              case 'hover':
              case 'active':
                return { className: state };
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
    to: '/files/document.pdf',
    variant: ChipVariant.Static,
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
