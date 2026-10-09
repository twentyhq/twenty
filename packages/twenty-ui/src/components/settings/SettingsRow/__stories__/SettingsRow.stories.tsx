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
import { SettingsRowCatalogExample } from './SettingsRowCatalogExample';

const meta: Meta<typeof SettingsRow> = {
  id: 'ui-components-settingsrow',
  title: 'UI/Components/Settings/SettingsRow',
  component: SettingsRow,
  args: { children: 'Notifications', startElement: <IconBell aria-hidden /> },
  parameters: { container: { width: 320 } },
};

export default meta;
type Story = StoryObj<typeof SettingsRow>;

export const Default: Story = { decorators: [ComponentDecorator] };
export const Checked: Story = {
  ...Default,
  args: { switchProps: { defaultChecked: true } },
};
export const Disabled: Story = {
  ...Default,
  args: { switchProps: { disabled: true, defaultChecked: true } },
};
export const ReadOnly: Story = {
  ...Default,
  args: { switchProps: { readOnly: true, defaultChecked: true } },
};
export const WithDescription: Story = {
  ...Default,
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { description: 'Updates by email' },
};

const STATE_PROPS = {
  off: {},
  on: { switchProps: { defaultChecked: true } },
  highlighted: { focused: true },
  disabled: { switchProps: { disabled: true } },
  'disabled on': { switchProps: { disabled: true, defaultChecked: true } },
  'read only': { switchProps: { readOnly: true, defaultChecked: true } },
} satisfies Record<string, Partial<SettingsRowProps>>;

export const Catalog: CatalogStory<
  StoryObj<typeof SettingsRowCatalogExample>,
  typeof SettingsRowCatalogExample
> = {
  decorators: [CatalogDecorator],
  render: (args) => <SettingsRowCatalogExample {...args} />,
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'size',
          values: ['sm', 'md'] satisfies SwitchSize[],
          props: (switchSize: SwitchSize) => ({ switchSize }),
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
