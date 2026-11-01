import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { Field } from '@ui/primitives/input/Field/Field';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { Switch } from '../Switch';

const meta: Meta<typeof Switch> = {
  title: 'UI/Input/Switch/Parts',
  component: Switch,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Composition: Story = {
  render: () => (
    <Switch.Root aria-label="Updates" defaultChecked>
      <Switch.Thumb></Switch.Thumb>
    </Switch.Root>
  ),
};

const FormExample = () => {
  const [checked, setChecked] = useState(false);
  const [submitted, setSubmitted] = useState('Not submitted');
  const rootRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const partRef = useRef<HTMLSpanElement>(null);

  return (
    <form
      onReset={() => setChecked(false)}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(String(new FormData(event.currentTarget).get('updates')));
      }}
    >
      <Field.Root name="updates">
        <Field.Label>Updates</Field.Label>
        <Switch.Root
          checked={checked}
          onCheckedChange={setChecked}
          required
          value="enabled"
          uncheckedValue="disabled"
          ref={rootRef}
          inputRef={inputRef}
          nativeButton
          render={<button />}
        >
          <Switch.Thumb
            ref={partRef}
            render={(props, state) => (
              <span {...props} data-active={state.checked} />
            )}
          />
        </Switch.Root>
        <Field.Description>Receive workspace updates.</Field.Description>
      </Field.Root>
      <Button type="submit">Save</Button>
      <Button type="reset">Reset</Button>
      <Button
        onClick={() => {
          rootRef.current?.focus();
          setSubmitted(`${inputRef.current?.name}/${partRef.current?.tagName}`);
        }}
      >
        Inspect refs
      </Button>
      <output>{submitted}</output>
    </form>
  );
};

export const FormAndRefs: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  render: () => <FormExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Updates' });
    await expect(control).toHaveAccessibleDescription(
      'Receive workspace updates.',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Not submitted');
    await userEvent.click(canvas.getByText('Updates'));
    await expect(control).toBeChecked();
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('enabled');
    await userEvent.click(canvas.getByRole('button', { name: 'Inspect refs' }));
    await expect(control).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent('updates/SPAN');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(control).not.toBeChecked();
  },
};
