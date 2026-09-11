import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconUser, IconX } from '@ui/icon';
import { Avatar } from '@ui/data-display/Avatar/Avatar';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { MemoryRouter } from 'react-router-dom';

import { type ChipSize } from '@ui/data-display/Chip/types/ChipSize';
import { type ChipVariant } from '@ui/data-display/Chip/types/ChipVariant';
import { LinkChip } from '@ui/data-display/LinkChip/LinkChip';

const meta: Meta<typeof LinkChip> = {
  title: 'UI/Data Display/LinkChip',
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
    children: 'Link Chip',
    to: '/example',
    size: 'sm',
    variant: 'ghost',
    color: 'primary',
  },
  decorators: [ComponentDecorator],
};

export const WithAvatar: Story = {
  args: {
    children: 'John Doe',
    to: '/users/john-doe',
    variant: 'ghost',
    startElement: (
      <Avatar name="JD" colorSeed="John Doe" size="sm" shape="circle" />
    ),
  },
  decorators: [ComponentDecorator],
};

export const WithIcon: Story = {
  args: {
    children: 'Company',
    to: '/companies/1',
    variant: 'ghost',
    startElement: <IconUser size={14} />,
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof LinkChip> = {
  args: { children: 'Link Chip', to: '/example' },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    color: { control: false },
    className: { control: false },
    endElement: { control: false },
    startElement: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'], active: ['.active'] },
    catalog: {
      dimensions: [
        {
          name: 'variants',
          values: ['ghost', 'soft', 'solid'],
          props: (variant: ChipVariant) => ({ variant }),
        },
        {
          name: 'sizes',
          values: ['sm', 'md'],
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

export const WithAvatarCatalog: CatalogStory<Story, typeof LinkChip> = {
  args: {
    children: 'John Doe',
    to: '/users/john-doe',
    startElement: (
      <Avatar name="JD" colorSeed="John Doe" size="sm" shape="circle" />
    ),
  },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    color: { control: false },
    className: { control: false },
    endElement: { control: false },
    startElement: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'], active: ['.active'] },
    catalog: {
      dimensions: [
        {
          name: 'variants',
          values: ['ghost', 'soft', 'solid'],
          props: (variant: ChipVariant) => ({ variant }),
        },
        {
          name: 'sizes',
          values: ['sm', 'md'],
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
    children: 'document.pdf',
    to: '/files/document.pdf',
    variant: 'soft',
    startElement: (
      <Avatar name="D" colorSeed="document" size="sm" shape="square" />
    ),
    endElement: <IconX size={14} />,
    endElementDivider: true,
  },
  decorators: [ComponentDecorator],
};
