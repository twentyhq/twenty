import { useId } from 'react';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Text } from '@ui/primitives/typography';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { themeCssVariables } from '@ui/theme';

import { Switch } from '../Switch';
import { type SwitchProps } from '../types/SwitchProps';
import { type SwitchSize } from '../types/SwitchSize';

const meta: Meta<typeof Switch> = {
  title: 'UI/Input/Switch/Switch',
  component: Switch,
  args: { 'aria-label': 'Notifications' },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Display: Story = {
  decorators: [ComponentDecorator],
  args: { 'aria-label': undefined },
  render: (args) => <SwitchDisplayExample {...args} />,
};

const SwitchDisplayExample = (props: SwitchProps) => {
  const generatedSwitchId = useId();
  const switchId = props.id ?? generatedSwitchId;

  return (
    <label
      htmlFor={switchId}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
    >
      <Switch {...props} id={switchId} name="notifications" />
      <Text render={<span />}>Email notifications</Text>
    </label>
  );
};

export const Checked: Story = { ...Display, args: { defaultChecked: true } };
export const Small: Story = {
  ...Checked,
  args: { defaultChecked: true, size: 'sm' },
};
export const CustomColor: Story = {
  ...Checked,
  args: {
    defaultChecked: true,
    style: { color: themeCssVariables.color.yellow },
  },
};
export const RightToLeft: Story = {
  ...Checked,
  render: (args) => (
    <div dir="rtl">
      <Switch {...args} />
    </div>
  ),
};

const STATE_PROPS = {
  off: {},
  on: { defaultChecked: true },
  disabled: { disabled: true },
  'disabled on': { disabled: true, defaultChecked: true },
  'read only': { readOnly: true, defaultChecked: true },
  focus: { className: 'focus' },
} satisfies Record<string, Partial<SwitchProps>>;

export const Catalog: CatalogStory<Story, typeof Switch> = {
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { focusVisible: ['.focus'] },
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
      options: { elementContainer: { style: { width: 120 } } },
    },
  },
};

export const CatalogDark: typeof Catalog = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
