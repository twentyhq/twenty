import { type Meta, type StoryObj } from '@storybook/react';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { MAIN_COLORS_LIGHT } from '@ui/theme';
import { useState } from 'react';

import { Toggle, type ToggleSize } from '../Toggle';

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
            return { color: MAIN_COLORS_LIGHT.yellow };
          },
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
