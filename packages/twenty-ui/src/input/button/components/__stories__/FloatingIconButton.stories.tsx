import { Meta, StoryObj } from '@storybook/react';
import { IconSearch } from '@ui/display';
import {
  CatalogDecorator,
  CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import {
  FloatingIconButton,
  FloatingIconButtonSize,
} from '../FloatingIconButton';

const meta: Meta<typeof FloatingIconButton> = {
  title: 'UI/Input/Button/FloatingIconButton',
  component: FloatingIconButton,
};

export default meta;
type Story = StoryObj<typeof FloatingIconButton>;

export const Default: Story = {
  args: {
    size: 'small',
    disabled: false,
    focus: false,
    applyBlur: true,
    applyShadow: true,
    position: 'standalone',
    Icon: IconSearch,
  },
  argTypes: {
    Icon: { control: false },
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof FloatingIconButton> = {
  args: { Icon: IconSearch },
  argTypes: {
    size: { control: false },
    disabled: { control: false },
    focus: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.pressed'] },
    catalog: {
      dimensions: [
        {
          name: 'sizes',
          values: ['small', 'medium'] satisfies FloatingIconButtonSize[],
          props: (size: FloatingIconButtonSize) => ({ size }),
        },
        {
          name: 'states',
          values: [
            'default',
            'hover',
            'pressed',
            'disabled',
            'focus',
            'disabled+focus',
          ],
          props: (state: string) => {
            switch (state) {
              case 'default':
                return {};
              case 'hover':
              case 'pressed':
                return { className: state };
              case 'focus':
                return { focus: true };
              case 'disabled':
                return { disabled: true };
              case 'disabled+focus':
                return { disabled: true, focus: true };
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
