import { type Meta, type StoryObj } from '@storybook/react-vite';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { themeCssVariables } from '@ui/theme-constants';
import { useState } from 'react';

import { Toggle, type ToggleSize } from '@ui/input/Toggle/Toggle';

type InteractiveToggleProps = {
  initialValue?: boolean;
  toggleSize?: ToggleSize;
  color?: string;
  disabled?: boolean;
};

const InteractiveToggle = ({
  initialValue = false,
  toggleSize = 'medium',
  color,
  disabled,
}: InteractiveToggleProps) => {
  const [value, setValue] = useState(initialValue);

  return (
    <Toggle
      value={value}
      onChange={setValue}
      toggleSize={toggleSize}
      color={color}
      disabled={disabled}
    />
  );
};

const meta: Meta<typeof InteractiveToggle> = {
  title: 'UI/Input/Toggle/Toggle',
  component: InteractiveToggle,
};

export default meta;
type Story = StoryObj<typeof InteractiveToggle>;

export const Default: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
  args: {
    initialValue: false,
    disabled: false,
    toggleSize: 'medium',
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof InteractiveToggle> = {
  args: {},
  argTypes: {
    toggleSize: { control: false },
    initialValue: { control: false },
    disabled: { control: false },
    color: { control: false },
  },
  parameters: {
    // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
    a11y: { test: 'todo' },
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: ['disabled', 'off', 'on'],
          props: (state: string) => {
            if (state === 'disabled') {
              return { disabled: true, initialValue: false };
            }
            if (state === 'on') {
              return { initialValue: true };
            }
            return { initialValue: false };
          },
        },
        {
          name: 'size',
          values: ['small', 'medium'] satisfies ToggleSize[],
          props: (toggleSize: ToggleSize) => ({ toggleSize }),
        },
        {
          name: 'color',
          values: ['default', 'custom color'],
          props: (color: string) => {
            if (color === 'default') {
              return {};
            }
            return { color: themeCssVariables.color.yellow };
          },
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
