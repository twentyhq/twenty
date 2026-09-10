import { Field as FieldPrimitive } from '@base-ui/react/field';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { CardPicker } from '@ui/input/CardPicker/CardPicker';
import { Field } from '@ui/input/Field/Field';
import { RadioGroup } from '@ui/input/RadioGroup/RadioGroup';
import { type RadioGroupProps } from '@ui/input/RadioGroup/types/RadioGroupProps';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { Radio } from '../Radio';

const RadioExample = (props: RadioGroupProps) => (
  <RadioGroup aria-label="Fruit" {...props}>
    <Radio value="apple">Apple</Radio>
    <div>
      <Radio value="banana" disabled>
        Banana
      </Radio>
    </div>
    <div>
      <Radio value="cherry">Cherry</Radio>
    </div>
  </RadioGroup>
);

const meta: Meta<typeof RadioExample> = {
  title: 'UI/Input/Radio/Interactions',
  component: RadioExample,
  args: { onValueChange: fn() },
};

export default meta;
type Story = StoryObj<typeof RadioExample>;

export const Keyboard: Story = {
  decorators: [ComponentDecorator],
  args: { defaultValue: 'apple' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const apple = canvas.getByRole('radio', { name: 'Apple' });
    const cherry = canvas.getByRole('radio', { name: 'Cherry' });
    await userEvent.tab();
    await expect(apple).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(cherry).toHaveFocus());
    await expect(cherry).toBeChecked();
    await expect(apple).not.toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      'cherry',
      expect.anything(),
    );
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(apple).toHaveFocus());
    await expect(apple).toBeChecked();
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(cherry).toBeChecked());
  },
};

export const UnselectedAndSpace: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement, args }) => {
    const apple = within(canvasElement).getByRole('radio', { name: 'Apple' });
    await userEvent.tab();
    await expect(apple).toHaveFocus();
    await expect(apple).not.toBeChecked();
    await userEvent.keyboard(' ');
    await expect(apple).toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(' ');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
  },
};

export const LabelAndDisabledOption: Story = {
  decorators: [ComponentDecorator],
  args: { defaultValue: 'apple' },
  render: (args) => (
    <RadioGroup {...args} aria-label="Fruit">
      <label htmlFor="radio-label-apple">
        <Radio id="radio-label-apple" value="apple" />
        Apple label
      </label>
      <label htmlFor="radio-label-banana">
        <Radio id="radio-label-banana" value="banana" disabled />
        Banana label
      </label>
      <label htmlFor="radio-label-cherry">
        <Radio id="radio-label-cherry" value="cherry" />
        Cherry label
      </label>
    </RadioGroup>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Banana label'));
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByText('Cherry label'));
    await expect(
      canvas.getByRole('radio', { name: 'Cherry label' }),
    ).toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
  },
};

export const DisabledGroup: Story = {
  decorators: [ComponentDecorator],
  args: { defaultValue: 'apple', disabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const cherry = canvas.getByRole('radio', { name: 'Cherry' });
    await expect(cherry).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(cherry);
    await userEvent.tab();
    await expect(cherry).not.toHaveFocus();
    await expect(canvas.getByRole('radio', { name: 'Apple' })).toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const ReadOnlyGroup: Story = {
  decorators: [ComponentDecorator],
  args: { defaultValue: 'apple', readOnly: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Cherry' }));
    await userEvent.keyboard('{ArrowUp} ');
    await expect(canvas.getByRole('radio', { name: 'Apple' })).toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const CanceledChange: Story = {
  decorators: [ComponentDecorator],
  args: {
    defaultValue: 'apple',
    onValueChange: fn((_value, details) => details.cancel()),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Cherry' }));
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('radio', { name: 'Apple' })).toBeChecked();
    await expect(
      canvas.getByRole('radio', { name: 'Cherry' }),
    ).not.toBeChecked();
  },
};

const ControlledExample = ({ onValueChange }: RadioGroupProps) => {
  const [value, setValue] = useState('apple');

  return (
    <>
      <RadioExample value={value} onValueChange={onValueChange} />
      <button type="button" onClick={() => setValue('cherry')}>
        Apply Cherry
      </button>
    </>
  );
};

export const Controlled: Story = {
  decorators: [ComponentDecorator],
  render: (args) => <ControlledExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Cherry' }));
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'cherry',
      expect.anything(),
    );
    await expect(canvas.getByRole('radio', { name: 'Apple' })).toBeChecked();
    await userEvent.click(canvas.getByRole('button', { name: 'Apply Cherry' }));
    await expect(canvas.getByRole('radio', { name: 'Cherry' })).toBeChecked();
  },
};

const FormExample = () => {
  const [value, setValue] = useState('apple');
  const [submitted, setSubmitted] = useState('');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(
          new FormData(event.currentTarget).getAll('fruit').join(', '),
        );
      }}
      onReset={() => setValue('apple')}
    >
      <Field.Root name="fruit">
        <Field.Label>Fruit</Field.Label>
        <RadioGroup value={value} onValueChange={setValue} required>
          <FieldPrimitive.Item>
            <Radio value="apple">Apple</Radio>
          </FieldPrimitive.Item>
          <FieldPrimitive.Item>
            <Radio value="cherry">Cherry</Radio>
          </FieldPrimitive.Item>
        </RadioGroup>
        <Field.Description>Choose one fruit</Field.Description>
      </Field.Root>
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
      <output aria-label="Submitted fruit">{submitted}</output>
    </form>
  );
};

export const Form: Story = {
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  render: () => <FormExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('radiogroup', { name: 'Fruit' }),
    ).toHaveAttribute('aria-required', 'true');
    await userEvent.click(canvas.getByRole('radio', { name: 'Cherry' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await expect(
      canvas.getByRole('status', { name: 'Submitted fruit' }),
    ).toHaveTextContent(/^cherry$/);
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(canvas.getByRole('radio', { name: 'Apple' })).toBeChecked();
  },
};

const InputRefExample = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <RadioGroup defaultValue={0} aria-label="Number">
        <Radio value={0}>Zero</Radio>
        <Radio value={1} inputRef={inputRef}>
          One
        </Radio>
      </RadioGroup>
      <button type="button" onClick={() => inputRef.current?.focus()}>
        Focus One
      </button>
    </>
  );
};

export const NumericValuesAndInputRef: Story = {
  decorators: [ComponentDecorator],
  render: () => <InputRefExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radio', { name: 'Zero' })).toBeChecked();
    await userEvent.click(canvas.getByRole('button', { name: 'Focus One' }));
    await expect(canvas.getByRole('radio', { name: 'One' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('radio', { name: 'One' })).toBeChecked();
  },
};

export const PolymorphismAndState: Story = {
  decorators: [ComponentDecorator],
  args: { defaultValue: 'apple' },
  render: (args) => (
    <RadioGroup {...args} aria-label="Fruit" render={<fieldset />}>
      <Radio value="apple" nativeButton render={<button type="button" />}>
        Apple
      </Radio>
      <Radio
        value="cherry"
        className={({ checked }) =>
          checked ? 'selected-consumer' : 'consumer'
        }
        style={({ checked }) => ({ marginTop: checked ? 7 : 3 })}
        render={(props, state) => (
          <div {...props} data-checked-state={state.checked} />
        )}
      >
        Cherry
      </Radio>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radiogroup').tagName).toBe('FIELDSET');
    await expect(canvas.getByRole('radio', { name: 'Apple' }).tagName).toBe(
      'BUTTON',
    );
    const cherry = canvas.getByRole('radio', { name: 'Cherry' });
    await expect(cherry).toHaveClass('consumer');
    await userEvent.click(cherry);
    await expect(cherry).toHaveClass('selected-consumer');
    await expect(cherry).toHaveStyle({ marginTop: '7px' });
    await expect(cherry).toHaveAttribute('data-checked-state', 'true');
  },
};

export const RightToLeft: Story = {
  decorators: [ComponentDecorator],
  args: { defaultValue: 'apple' },
  render: (args) => (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <RadioExample {...args} />
      </div>
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: 'Cherry' })).toBeChecked(),
    );
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: 'Apple' })).toBeChecked(),
    );
  },
};

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
      {value === 'yearly' && <input aria-label="Purchase order" />}
    </RadioGroup>
  );
};

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
