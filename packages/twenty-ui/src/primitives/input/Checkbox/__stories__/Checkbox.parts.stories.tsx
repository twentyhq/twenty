import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { IconCheck } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { Field } from '@ui/primitives/input/Field/Field';
import { Text } from '@ui/primitives/typography/Text/Text';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { Checkbox } from '../Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Input/Checkbox/Parts',
  component: Checkbox,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Composition: Story = {
  render: () => (
    <Checkbox.Root aria-label="Updates" defaultChecked>
      <Checkbox.Indicator>
        <IconCheck aria-hidden />
      </Checkbox.Indicator>
    </Checkbox.Root>
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
        <Checkbox.Root
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
          <Checkbox.Indicator
            ref={partRef}
            render={(props, state) => (
              <span {...props} data-active={state.checked} />
            )}
          />
        </Checkbox.Root>
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
    const control = canvas.getByRole('checkbox', { name: 'Updates' });
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

const IndicatorExample = () => {
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);

  return (
    <Checkbox.Root
      checked={checked}
      indeterminate={indeterminate}
      aria-label="Partial selection"
      onCheckedChange={(nextChecked) => {
        setChecked(nextChecked);
        setIndeterminate(false);
      }}
    >
      <Checkbox.Indicator
        keepMounted
        render={(props, state) => (
          <span {...props} data-mixed={state.indeterminate} />
        )}
      />
    </Checkbox.Root>
  );
};

export const IndicatorState: Story = {
  render: () => <IndicatorExample />,
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole('checkbox');
    const indicator = control.querySelector('[data-mixed]');
    await expect(control).toBePartiallyChecked();
    await expect(indicator).toHaveAttribute('data-mixed', 'true');
    await userEvent.click(control);
    await expect(control).toBeChecked();
    await expect(indicator).toHaveAttribute('data-mixed', 'false');
    await userEvent.keyboard(' ');
    await expect(control).not.toBeChecked();
    await expect(indicator).toHaveAttribute('data-unchecked');
    await expect(indicator).toHaveStyle({ opacity: '0' });
    await expect(indicator).toBeInTheDocument();
  },
};

export const TallChildren: Story = {
  render: () => (
    <>
      {(['sm', 'md'] as const).map((size) =>
        [false, true].map((hoverable) => (
          <Checkbox.Root
            key={`${size}-${hoverable}`}
            size={size}
            hoverable={hoverable}
            defaultChecked
            aria-label={`${size} ${hoverable ? 'with hover' : 'without hover'}`}
          >
            <Checkbox.Indicator data-testid="selection-indicator">
              <IconCheck aria-hidden />
            </Checkbox.Indicator>
            <Text render={<span />} style={{ lineHeight: '48px' }}>
              Tall content
            </Text>
          </Checkbox.Root>
        )),
      )}
    </>
  ),
  play: async ({ canvasElement }) => {
    for (const checkbox of within(canvasElement).getAllByRole('checkbox')) {
      const indicator = within(checkbox).getByTestId('selection-indicator');
      const checkboxBounds = checkbox.getBoundingClientRect();
      const indicatorBounds = indicator.getBoundingClientRect();
      const checkboxCenter = checkboxBounds.top + checkboxBounds.height / 2;
      const indicatorCenter = indicatorBounds.top + indicatorBounds.height / 2;

      await expect(Math.abs(checkboxCenter - indicatorCenter)).toBeLessThan(
        0.5,
      );
    }
  },
};
