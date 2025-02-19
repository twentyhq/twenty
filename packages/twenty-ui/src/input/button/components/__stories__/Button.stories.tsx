import { Meta, StoryObj } from '@storybook/react';
import { IconSearch } from '@ui/display';
import {
  CatalogDecorator,
  CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import {
  Button,
  ButtonAccent,
  ButtonPosition,
  ButtonSize,
  ButtonVariant,
} from '../Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Input/Button/Button',
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  argTypes: {
    hotkeys: { control: false },
    Icon: { control: false },
  },
  args: {
    title: 'Button',
    size: 'small',
    variant: 'primary',
    inverted: false,
    accent: 'danger',
    disabled: false,
    focus: false,
    fullWidth: false,
    soon: false,
    position: 'standalone',
    Icon: IconSearch,
    className: '',
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof Button> = {
  args: { title: 'Filter', Icon: IconSearch, hotkeys: ['⌘', 'O'] },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    accent: { control: false },
    disabled: { control: false },
    focus: { control: false },
    fullWidth: { control: false },
    soon: { control: false },
    position: { control: false },
    className: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'sizes',
          values: ['small', 'medium'] satisfies ButtonSize[],
          props: (size: ButtonSize) => ({ size }),
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
              case 'active':
                return { active: true };
              case 'disabled+focus':
                return { focus: true, disabled: true };
              default:
                return {};
            }
          },
        },
        {
          name: 'accents',
          values: ['default', 'blue', 'danger'] satisfies ButtonAccent[],
          props: (accent: ButtonAccent) => ({ accent }),
        },
        {
          name: 'variants',
          values: [
            'primary',
            'secondary',
            'tertiary',
          ] satisfies ButtonVariant[],
          props: (variant: ButtonVariant) => ({ variant }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};

export const SoonCatalog: CatalogStory<Story, typeof Button> = {
  args: { title: 'Filter', Icon: IconSearch, soon: true },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    accent: { control: false },
    disabled: { control: false },
    focus: { control: false },
    fullWidth: { control: false },
    soon: { control: false },
    position: { control: false },
    className: { control: false },
    hotkeys: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'sizes',
          values: ['small', 'medium'] satisfies ButtonSize[],
          props: (size: ButtonSize) => ({ size }),
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
              case 'active':
                return { active: true };
              case 'disabled+focus':
                return { focus: true, disabled: true };
              default:
                return {};
            }
          },
        },
        {
          name: 'accents',
          values: ['default', 'blue', 'danger'] satisfies ButtonAccent[],
          props: (accent: ButtonAccent) => ({ accent }),
        },
        {
          name: 'variants',
          values: [
            'primary',
            'secondary',
            'tertiary',
          ] satisfies ButtonVariant[],
          props: (variant: ButtonVariant) => ({ variant }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};

export const PositionCatalog: CatalogStory<Story, typeof Button> = {
  args: { title: 'Filter', Icon: IconSearch },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    accent: { control: false },
    disabled: { control: false },
    focus: { control: false },
    fullWidth: { control: false },
    soon: { control: false },
    position: { control: false },
    hotkeys: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'positions',
          values: [
            'standalone',
            'left',
            'middle',
            'right',
          ] satisfies ButtonPosition[],
          props: (position: ButtonPosition) => ({ position }),
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
              case 'active':
                return { active: true };
              case 'disabled+focus':
                return { focus: true, disabled: true };
              default:
                return {};
            }
          },
        },
        {
          name: 'sizes',
          values: ['small', 'medium'] satisfies ButtonSize[],
          props: (size: ButtonSize) => ({ size }),
        },
        {
          name: 'variants',
          values: [
            'primary',
            'secondary',
            'tertiary',
          ] satisfies ButtonVariant[],
          props: (variant: ButtonVariant) => ({ variant }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};

export const ShortcutCatalog: CatalogStory<Story, typeof Button> = {
  args: { title: 'Actions', hotkeys: ['⌘', 'O'] },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    accent: { control: false },
    disabled: { control: false },
    focus: { control: false },
    fullWidth: { control: false },
    soon: { control: false },
    position: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'sizes',
          values: ['small', 'medium'] satisfies ButtonSize[],
          props: (size: ButtonSize) => ({ size }),
        },
        {
          name: 'accents',
          values: ['default', 'blue', 'danger'] satisfies ButtonAccent[],
          props: (accent: ButtonAccent) => ({ accent }),
        },
        {
          name: 'variants',
          values: [
            'primary',
            'secondary',
            'tertiary',
          ] satisfies ButtonVariant[],
          props: (variant: ButtonVariant) => ({ variant }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};

export const FullWidth: Story = {
  args: { title: 'Filter', Icon: IconSearch, fullWidth: true },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    accent: { control: false },
    focus: { control: false },
    disabled: { control: false },
    fullWidth: { control: false },
    soon: { control: false },
    position: { control: false },
    className: { control: false },
    Icon: { control: false },
  },
  decorators: [ComponentDecorator],
};
