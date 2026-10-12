import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { RadioGroup } from '@ui/primitives/input/RadioGroup/RadioGroup';
import { ComponentDecorator } from '@ui/testing';

import { Radio } from '../Radio';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/Input/Radio/Interactions/Form association',
  component: RadioGroup,
  decorators: [ComponentDecorator],
  tags: ['!autodocs'],
  args: { onValueChange: fn() },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const ExternalForm: Story = {
  render: (args) => (
    <>
      <form id="preferences" aria-label="Preferences" />
      <RadioGroup form="preferences" name="fruit" aria-label="Fruit" required>
        <Radio.Root value="apple">Apple</Radio.Root>
        <Radio.Root value="cherry">Cherry</Radio.Root>
      </RadioGroup>
      <RadioGroup
        form="preferences"
        name="locked"
        aria-label="Read only preference"
        defaultValue="original"
        readOnly
        onValueChange={args.onValueChange}
      >
        <Radio.Root value="original">Original</Radio.Root>
        <Radio.Root value="replacement">Replacement</Radio.Root>
      </RadioGroup>
      <RadioGroup
        form="preferences"
        name="excluded"
        aria-label="Disabled preference"
        defaultValue="disabled"
        disabled
      >
        <Radio.Root value="disabled">Disabled</Radio.Root>
      </RadioGroup>
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole<HTMLFormElement>('form', {
      name: 'Preferences',
    });
    const appleInput = canvasElement.querySelector<HTMLInputElement>(
      'input[value="apple"]',
    );
    await expect(appleInput?.form).toBe(form);
    await expect(form.checkValidity()).toBe(false);
    await expect(Object.fromEntries(new FormData(form))).toEqual({
      locked: 'original',
    });

    await userEvent.click(canvas.getByRole('radio', { name: 'Apple' }));
    await userEvent.click(canvas.getByRole('radio', { name: 'Replacement' }));

    await expect(form.checkValidity()).toBe(true);
    await expect(canvas.getByRole('radio', { name: 'Original' })).toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(Object.fromEntries(new FormData(form))).toEqual({
      fruit: 'apple',
      locked: 'original',
    });
  },
};
