import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing';
import { useState } from 'react';

import { SearchInput } from '../SearchInput';

type InteractiveSearchInputProps = {
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
};

const InteractiveSearchInput = ({
  placeholder,
  disabled,
  autoFocus,
  className,
}: InteractiveSearchInputProps) => {
  const [value, setValue] = useState('');

  return (
    <SearchInput
      value={value}
      onChange={setValue}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      className={className}
    />
  );
};

const meta: Meta<typeof InteractiveSearchInput> = {
  title: 'UI/Input/SearchInput',
  component: InteractiveSearchInput,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof InteractiveSearchInput>;

export const Default: Story = {
  args: {
    placeholder: 'Search...',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Search...',
    disabled: true,
  },
};
