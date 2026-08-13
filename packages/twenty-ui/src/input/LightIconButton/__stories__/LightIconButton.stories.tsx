import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconSearch } from '@ui/icon';
import { MemoryRouter } from 'react-router-dom';
import { expect, within } from 'storybook/test';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import {
  LightIconButton,
  type LightIconButtonAccent,
  type LightIconButtonSize,
} from '@ui/input/LightIconButton/LightIconButton';

const meta: Meta<typeof LightIconButton> = {
  title: 'UI/Input/Button/LightIconButton',
  component: LightIconButton,
};

export default meta;
type Story = StoryObj<typeof LightIconButton>;

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

export const WithLink: Story = {
  args: {
    'aria-label': 'Open search',
    Icon: IconSearch,
    title: 'Open search',
    to: '/search',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
    ComponentDecorator,
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = await canvas.findByRole('link', { name: 'Open search' });
    expect(link).toHaveAttribute('href', '/search');
  },
};

export const Catalog: CatalogStory<Story, typeof LightIconButton> = {
  args: { title: 'Filter', Icon: IconSearch },
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
          values: ['secondary', 'tertiary'] satisfies LightIconButtonAccent[],
          props: (accent: LightIconButtonAccent) => ({ accent }),
        },
        {
          name: 'sizes',
          values: ['small', 'medium'] satisfies LightIconButtonSize[],
          props: (size: LightIconButtonSize) => ({ size }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
