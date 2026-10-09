import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { Field } from '@ui/primitives/input/Field/Field';
import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { RadioGroup } from '@ui/primitives/input/RadioGroup/RadioGroup';
import { type RadioGroupProps } from '@ui/primitives/input/RadioGroup/types/RadioGroupProps';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { Radio } from '../Radio';
import { type RadioProps } from '../types/RadioProps';

const RadioExample = ({
  variant,
  ...props
}: RadioGroupProps & Pick<RadioProps, 'variant'>) => (
  <RadioGroup aria-label="Fruit" {...props}>
    <Radio variant={variant} value="apple">
      Apple
    </Radio>
    <div>
      <Radio variant={variant} value="banana" disabled>
        Banana
      </Radio>
    </div>
    <div>
      <Radio variant={variant} value="cherry">
        Cherry
      </Radio>
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
      expect.objectContaining({
        reason: 'none',
        isCanceled: false,
      }),
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
      <Button onClick={() => setValue('cherry')}>Apply Cherry</Button>
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

const FormExample = ({ variant }: Pick<RadioProps, 'variant'>) => {
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
          <Field.Item>
            <Radio variant={variant} value="apple">
              Apple
            </Radio>
          </Field.Item>
          <Field.Item>
            <Radio variant={variant} value="cherry">
              Cherry
            </Radio>
          </Field.Item>
        </RadioGroup>
        <Field.Description>Choose one fruit</Field.Description>
      </Field.Root>
      <Button type="submit">Submit</Button>
      <Button type="reset">Reset</Button>
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
      <Button onClick={() => inputRef.current?.focus()}>Focus One</Button>
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

export const CardsKeyboard: Story = {
  ...Keyboard,
  args: { ...Keyboard.args, variant: 'card' },
};

export const CardsDisabledGroup: Story = {
  ...DisabledGroup,
  args: { ...DisabledGroup.args, variant: 'card' },
};

export const CardsReadOnlyGroup: Story = {
  ...ReadOnlyGroup,
  args: { ...ReadOnlyGroup.args, variant: 'card' },
};

export const CardsForm: Story = {
  ...Form,
  render: () => <FormExample variant="card" />,
};

export const CardsRightToLeft: Story = {
  ...RightToLeft,
  args: { ...RightToLeft.args, variant: 'card' },
};

export const CompleteParts: Story = {
  decorators: [ComponentDecorator],
  args: { defaultValue: 'apple' },
  render: (args) => (
    <RadioGroup {...args} aria-label="Fruit" render={<fieldset />}>
      <Radio.Root value="apple">
        <Radio.Indicator keepMounted render={<strong />} aria-hidden>
          Selected
        </Radio.Indicator>
        Apple
      </Radio.Root>
      <Radio.Root value="cherry">
        <Radio.Indicator keepMounted render={<strong />} aria-hidden>
          Selected
        </Radio.Indicator>
        Cherry
      </Radio.Root>
    </RadioGroup>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const apple = canvas.getByRole('radio', { name: 'Apple' });
    const cherry = canvas.getByRole('radio', { name: 'Cherry' });
    await expect(canvas.getByRole('radiogroup').tagName).toBe('FIELDSET');
    await expect(apple.tagName).toBe('SPAN');
    await expect(apple.querySelector('strong')).toHaveAttribute('data-checked');
    await expect(cherry.querySelector('strong')).toHaveAttribute(
      'data-unchecked',
    );
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowRight}');
    await expect(cherry).toHaveFocus();
    await expect(cherry).toBeChecked();
    await expect(cherry.querySelector('strong')).toHaveAttribute(
      'data-checked',
    );
    await expect(apple.querySelector('strong')).toHaveAttribute(
      'data-unchecked',
    );
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
  },
};

export const NativeButtonCards: Story = {
  decorators: [ComponentDecorator],
  args: { defaultValue: 'apple' },
  render: (args) => (
    <RadioGroup {...args} aria-label="Fruit">
      <Radio
        variant="card"
        value="apple"
        nativeButton
        render={<button type="button" />}
      >
        Apple
      </Radio>
      <Radio
        variant="card"
        value="cherry"
        nativeButton
        render={<button type="button" />}
      >
        Cherry
      </Radio>
    </RadioGroup>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const apple = canvas.getByRole('radio', { name: 'Apple' });
    const cherry = canvas.getByRole('radio', { name: 'Cherry' });
    await expect(apple.tagName).toBe('BUTTON');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(cherry).toHaveFocus();
    await expect(cherry).toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
  },
};
