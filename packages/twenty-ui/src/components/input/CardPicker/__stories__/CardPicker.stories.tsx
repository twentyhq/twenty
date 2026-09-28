import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Input } from '@ui/primitives/input/Input/Input';
import { RadioGroup } from '@ui/primitives/input/RadioGroup/RadioGroup';
import { type RadioGroupProps } from '@ui/primitives/input/RadioGroup/types/RadioGroupProps';
import { ComponentDecorator } from '@ui/testing';

import { CardPicker } from '../CardPicker';

const CardsExample = ({ onValueChange }: RadioGroupProps) => {
  const [value, setValue] = useState('monthly');

  return (
    <RadioGroup
      aria-label="Billing interval"
      value={value}
      onValueChange={(nextValue, details) => {
        setValue(nextValue);
        onValueChange?.(nextValue, details);
      }}
    >
      <CardPicker value="monthly">Monthly</CardPicker>
      <CardPicker value="yearly">Yearly</CardPicker>
      {value === 'yearly' && <Input aria-label="Purchase order" />}
    </RadioGroup>
  );
};

const meta: Meta<typeof CardsExample> = {
  title: 'UI/Input/Radio/Interactions',
  component: CardsExample,
  tags: ['!autodocs'],
  args: { onValueChange: fn() },
};

export default meta;

type Story = StoryObj<typeof CardsExample>;

export const Cards: Story = {
  decorators: [ComponentDecorator],
  render: (args) => <CardsExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Yearly'));
    await expect(canvas.getByRole('radio', { name: 'Yearly' })).toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Purchase order' }),
      'PO-42',
    );
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('radio', { name: 'Monthly' }));
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Yearly' })).toBeChecked();
  },
};
