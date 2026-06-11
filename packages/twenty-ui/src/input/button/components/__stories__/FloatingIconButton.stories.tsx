import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconSearch } from '@ui/display';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import {
  FloatingIconButton,
  type FloatingIconButtonSize,
} from '../FloatingIconButton';

const meta: Meta<typeof FloatingIconButton> = {
  title: 'UI/Input/Button/FloatingIconButton',
  component: FloatingIconButton,
};

export default meta;
type Story = StoryObj<typeof FloatingIconButton>;

export const Default: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
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
    // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
    a11y: { test: 'todo' },
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
