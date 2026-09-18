import { type Meta, type StoryObj } from '@storybook/react-vite';
import { AnimatedLightIconButton } from '@ui/components/input/AnimatedLightIconButton/AnimatedLightIconButton';
import { type AnimatedLightIconButtonProps } from '@ui/components/input/AnimatedLightIconButton/types/AnimatedLightIconButtonProps';
import { IconSearch } from '@ui/icon';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  ComponentDecorator,
  type CatalogStory,
} from '@ui/testing';

const meta: Meta<typeof AnimatedLightIconButton> = {
  title: 'UI/Input/Button/AnimatedLightIconButton',
  component: AnimatedLightIconButton,
};

export default meta;
type Story = StoryObj<typeof AnimatedLightIconButton>;

export const Default: Story = {
  args: {
    title: 'Filter',
    accent: 'secondary',
    disabled: false,
    active: false,
    focus: false,
    Icon: IconSearch,
  },
  argTypes: {
    Icon: { control: false },
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof AnimatedLightIconButton> = {
  args: {
    title: 'Filter',
    Icon: IconSearch,
  },
  argTypes: {
    accent: { control: false },
    disabled: { control: false },
    active: { control: false },
    focus: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'], active: ['.pressed'] },
    catalog: {
      dimensions: [
        {
          name: 'states',
          values: [
            'default',
            'hover',
            'pressed',
            'disabled',
            'active',
            'focus',
            'disabled+focus',
            'disabled+active',
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
              case 'active':
                return { active: true };
              case 'disabled+focus':
                return { disabled: true, focus: true };
              case 'disabled+active':
                return { disabled: true, active: true };
              default:
                return {};
            }
          },
        },
        {
          name: 'accents',
          values: [
            'secondary',
            'tertiary',
          ] satisfies AnimatedLightIconButtonProps['accent'][],
          props: (accent: AnimatedLightIconButtonProps['accent']) => ({
            accent,
          }),
        },
        {
          name: 'sizes',
          values: [
            'small',
            'medium',
          ] satisfies AnimatedLightIconButtonProps['size'][],
          props: (size: AnimatedLightIconButtonProps['size']) => ({ size }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
