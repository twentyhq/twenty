import { type Meta, type StoryObj } from '@storybook/react';
import { IconSearch } from '@ui/display';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { LightButton, type LightButtonAccent } from '../LightButton';

const meta: Meta<typeof LightButton> = {
  title: 'UI/Input/Button/LightButton',
  component: LightButton,
};

export default meta;
type Story = StoryObj<typeof LightButton>;

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

export const Catalog: CatalogStory<Story, typeof LightButton> = {
  args: { title: 'Filter', Icon: IconSearch },
  argTypes: {
    accent: { control: false },
    disabled: { control: false },
    active: { control: false },
    focus: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.pressed'] },
    catalog: {
      dimensions: [
        {
          name: 'accents',
          values: ['secondary', 'tertiary'] satisfies LightButtonAccent[],
          props: (accent: LightButtonAccent) => ({ accent }),
        },
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
      ],
    },
  },
  decorators: [CatalogDecorator],
};
