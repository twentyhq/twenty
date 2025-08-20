import { type Meta, type StoryObj } from '@storybook/react';
import { IconSearch } from '@ui/display';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { FloatingButton, type FloatingButtonSize } from '../FloatingButton';

const meta: Meta<typeof FloatingButton> = {
  title: 'UI/Input/Button/FloatingButton',
  component: FloatingButton,
};

export default meta;
type Story = StoryObj<typeof FloatingButton>;

export const Default: Story = {
  args: {
    title: 'Filter',
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

export const Catalog: CatalogStory<Story, typeof FloatingButton> = {
  args: { title: 'Filter', Icon: IconSearch },
  argTypes: {
    size: { control: false },
    disabled: { control: false },
    position: { control: false },
    focus: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.pressed'] },
    catalog: {
      dimensions: [
        {
          name: 'sizes',
          values: ['small', 'medium'] satisfies FloatingButtonSize[],
          props: (size: FloatingButtonSize) => ({ size }),
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
