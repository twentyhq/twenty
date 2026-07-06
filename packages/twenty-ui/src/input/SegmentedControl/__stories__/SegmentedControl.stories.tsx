import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconComment, IconHome } from '@ui/icon';
import { ComponentDecorator } from '@ui/testing';
import { useState } from 'react';

import {
  SegmentedControl,
  type SegmentedControlOption,
} from '@ui/input/SegmentedControl/SegmentedControl';

type InteractiveSegmentedControlProps = {
  initialValue: string;
  options: SegmentedControlOption<string>[];
  role?: 'group' | 'tablist';
};

const InteractiveSegmentedControl = ({
  initialValue,
  options,
  role,
}: InteractiveSegmentedControlProps) => {
  const [value, setValue] = useState(initialValue);

  return (
    <SegmentedControl
      ariaLabel="Segmented control"
      onChange={setValue}
      options={options}
      role={role}
      value={value}
    />
  );
};

const meta: Meta<typeof InteractiveSegmentedControl> = {
  title: 'UI/Input/SegmentedControl',
  component: InteractiveSegmentedControl,
};

export default meta;
type Story = StoryObj<typeof InteractiveSegmentedControl>;

export const Default: Story = {
  args: {
    initialValue: 'annual',
    options: [
      { label: 'Annual', value: 'annual' },
      { label: 'Monthly', value: 'monthly' },
    ],
  },
  decorators: [ComponentDecorator],
};

export const IconOnlyTabList: Story = {
  args: {
    initialValue: 'home',
    options: [
      { Icon: IconHome, ariaLabel: 'Home', value: 'home' },
      { Icon: IconComment, ariaLabel: 'Chat', value: 'chat' },
    ],
    role: 'tablist',
  },
  decorators: [ComponentDecorator],
};

export const WithDisabledOption: Story = {
  args: {
    initialValue: 'annual',
    options: [
      { label: 'Annual', value: 'annual' },
      { label: 'Monthly', value: 'monthly' },
      { disabled: true, label: 'Weekly', value: 'weekly' },
    ],
  },
  decorators: [ComponentDecorator],
};
