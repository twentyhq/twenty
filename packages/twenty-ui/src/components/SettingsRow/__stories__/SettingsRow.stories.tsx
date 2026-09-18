import { type Meta, type StoryObj } from '@storybook/react-vite';

import { IconBell } from '@ui/icon';
import { type SwitchSize } from '@ui/primitives/input/Switch/types/SwitchSize';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { SettingsRow } from '../SettingsRow';
import { type SettingsRowProps } from '../types/SettingsRowProps';

const meta: Meta<typeof SettingsRow> = {
  title: 'UI/Components/SettingsRow',
  component: SettingsRow,
  args: { children: 'Notifications', startIcon: <IconBell aria-hidden /> },
  parameters: { container: { width: 320 } },
};

export default meta;
type Story = StoryObj<typeof SettingsRow>;

export const Default: Story = { decorators: [ComponentDecorator] };
export const Checked: Story = { ...Default, args: { defaultChecked: true } };
export const Disabled: Story = {
  ...Default,
  args: { disabled: true, defaultChecked: true },
};
export const ReadOnly: Story = {
  ...Default,
  args: { readOnly: true, defaultChecked: true },
};
export const WithDescription: Story = {
  ...Default,
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { description: 'Updates by email' },
};

const STATE_PROPS = {
  off: {},
  on: { defaultChecked: true },
  highlighted: { focused: true },
  disabled: { disabled: true },
  'disabled on': { disabled: true, defaultChecked: true },
  'read only': { readOnly: true, defaultChecked: true },
} satisfies Record<string, Partial<SettingsRowProps>>;

export const Catalog: CatalogStory<Story, typeof SettingsRow> = {
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'size',
          values: ['sm', 'md'] satisfies SwitchSize[],
          props: (size: SwitchSize) => ({ size }),
        },
        {
          name: 'state',
          values: Object.keys(STATE_PROPS),
          props: (state: keyof typeof STATE_PROPS) => STATE_PROPS[state],
        },
      ],
      options: { elementContainer: { style: { width: 240 } } },
    },
  },
};

export const CatalogDark: typeof Catalog = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
