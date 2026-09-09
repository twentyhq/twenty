import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { IconCheck } from '@ui/icon';
import { Field } from '@ui/input/Field/Field';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { Select } from '../Select';
import { type SelectRootProps } from '../types/SelectRootProps';
import { SelectExample, SELECT_ITEMS } from './SelectExample';
import { waitForSelectPopup } from './waitForSelectPopup';

const meta: Meta<typeof SelectExample> = {
  title: 'UI/Input/Select/Interactions',
  component: SelectExample,
  parameters: { container: { width: 280, height: 240 } },
};

export default meta;
type Story = StoryObj<typeof SelectExample>;

export const Keyboard: Story = {
  decorators: [ComponentDecorator],
  args: { defaultValue: 'apple', onValueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    const popup = await waitForSelectPopup(canvasElement);
    const options = within(popup);
    await waitFor(() =>
      expect(options.getByRole('option', { name: 'Apple' })).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowDown}');
    await expect(options.getByRole('option', { name: 'Banana' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowDown}');
    await expect(options.getByRole('option', { name: 'Cherry' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(
      options.getByRole('option', { name: 'Dragon fruit' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(options.getByRole('option', { name: 'Apple' })).toHaveFocus();
    await userEvent.keyboard('c');
    await expect(options.getByRole('option', { name: 'Cherry' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(popup).not.toBeVisible());
    await expect(trigger).toHaveTextContent('Cherry');
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard(' ');
    await waitForSelectPopup(canvasElement);
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false'),
    );
    await expect(trigger).toHaveTextContent('Cherry');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const DisabledItem: Story = {
  decorators: [ComponentDecorator],
  args: { defaultValue: 'apple', onValueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await userEvent.click(trigger);
    const popup = await waitForSelectPopup(canvasElement);
    const disabled = within(popup).getByRole('option', { name: 'Banana' });
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(disabled);
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(trigger).toHaveTextContent('Apple');
    await expect(popup).toBeVisible();
  },
};

export const Disabled: Story = {
  decorators: [ComponentDecorator],
  args: {
    disabled: true,
    defaultValue: 'apple',
    onOpenChange: fn(),
    onValueChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    await userEvent.tab();
    await expect(trigger).not.toHaveFocus();
    await expect(args.onOpenChange).not.toHaveBeenCalled();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const ReadOnly: Story = {
  decorators: [ComponentDecorator],
  args: { readOnly: true, defaultValue: 'apple', onValueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await expect(trigger).toHaveAttribute('aria-readonly', 'true');
    await userEvent.click(trigger);
    const popup = await waitForSelectPopup(canvasElement);
    await userEvent.click(
      within(popup).getByRole('option', { name: 'Cherry' }),
    );
    await userEvent.keyboard('{End}{Enter}');
    await expect(trigger).toHaveTextContent('Apple');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeVisible());
  },
};

const ControlledSelectExample = (props: SelectRootProps<string, boolean>) => {
  const [value, setValue] = useState<string | null>('apple');

  return (
    <>
      <SelectExample {...props} value={value} modal={false} />
      <button type="button" onClick={() => setValue('cherry')}>
        Apply Cherry
      </button>
    </>
  );
};

export const ControlledValue: Story = {
  decorators: [ComponentDecorator],
  args: { onValueChange: fn() },
  render: (args) => (
    <ControlledSelectExample onValueChange={args.onValueChange} />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);
    const popup = await waitForSelectPopup(canvasElement);
    await userEvent.click(
      within(popup).getByRole('option', { name: 'Cherry' }),
    );
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'cherry',
      expect.anything(),
    );
    await waitFor(() => expect(popup).not.toBeVisible());
    await expect(trigger).toHaveTextContent('Apple');
    await userEvent.click(canvas.getByRole('button', { name: 'Apply Cherry' }));
    await expect(trigger).toHaveTextContent('Cherry');
  },
};

const ControlledOpenExample = (props: SelectRootProps<string, boolean>) => {
  const [open, setOpen] = useState(true);

  return (
    <>
      <SelectExample
        {...props}
        defaultValue="apple"
        open={open}
        modal={false}
      />
      <button type="button" onClick={() => setOpen(false)}>
        Apply closed state
      </button>
    </>
  );
};

export const ControlledOpen: Story = {
  decorators: [ComponentDecorator],
  args: { onOpenChange: fn() },
  render: (args) => <ControlledOpenExample onOpenChange={args.onOpenChange} />,
  play: async ({ canvasElement, args }) => {
    const popup = await waitForSelectPopup(canvasElement);
    await userEvent.click(
      within(popup).getByRole('option', { name: 'Cherry' }),
    );
    await expect(args.onOpenChange).toHaveBeenCalledWith(
      false,
      expect.anything(),
    );
    await expect(popup).toBeVisible();
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Apply closed state' }),
    );
    await waitFor(() => expect(popup).not.toBeVisible());
  },
};

export const MultipleKeyboard: Story = {
  decorators: [ComponentDecorator],
  args: { multiple: true, defaultValue: ['apple'], onValueChange: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    const popup = await waitForSelectPopup(canvasElement);
    await userEvent.keyboard('{End} ');
    await expect(
      within(popup).getByRole('option', { name: 'Dragon fruit' }),
    ).toHaveAttribute('aria-selected', 'true');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      ['apple', 'dragon-fruit'],
      expect.anything(),
    );
    await userEvent.keyboard(' ');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      ['apple'],
      expect.anything(),
    );
    await expect(popup).toBeVisible();
  },
};

export const ObjectValues: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <Select.Root
      defaultValue={{ id: 1, name: 'Ada' }}
      itemToStringLabel={(person) => person.name}
      itemToStringValue={(person) => String(person.id)}
      isItemEqualToValue={(person, value) => person.id === value.id}
    >
      <Select.Trigger aria-label="Owner">
        <Select.Value />
      </Select.Trigger>
      <Select.Popup>
        <Select.Item value={{ id: 1, name: 'Ada' }}>Ada</Select.Item>
        <Select.Item value={{ id: 2, name: 'Grace' }}>Grace</Select.Item>
      </Select.Popup>
    </Select.Root>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox', {
      name: 'Owner',
    });
    await expect(trigger).toHaveTextContent('Ada');
    await userEvent.click(trigger);
    const popup = await waitForSelectPopup(canvasElement);
    await expect(
      within(popup).getByRole('option', { name: 'Ada' }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(within(popup).getByRole('option', { name: 'Grace' }));
    await waitFor(() => expect(popup).not.toBeVisible());
    await expect(trigger).toHaveTextContent('Grace');
  },
};

const SelectFormExample = () => {
  const [submitted, setSubmitted] = useState('');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(
          new FormData(event.currentTarget).getAll('fruit').join(', '),
        );
      }}
    >
      <Field.Root name="fruit">
        <Field.Label>Fruit</Field.Label>
        <Select.Root
          name="fruit"
          items={SELECT_ITEMS}
          multiple
          defaultValue={['apple']}
        >
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Popup>
            {SELECT_ITEMS.map(({ value, label }) => (
              <Select.Item key={value} value={value}>
                {label}
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Root>
        <Field.Description>Choose fruit for delivery</Field.Description>
      </Field.Root>
      <button type="submit">Submit</button>
      <output aria-label="Submitted fruit">{submitted}</output>
    </form>
  );
};

export const Form: Story = {
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  render: () => <SelectFormExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', {
      name: 'Fruit',
      description: 'Choose fruit for delivery',
    });
    await userEvent.click(trigger);
    const popup = await waitForSelectPopup(canvasElement);
    await userEvent.click(
      within(popup).getByRole('option', { name: 'Cherry' }),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await expect(
      canvas.getByRole('status', { name: 'Submitted fruit' }),
    ).toHaveTextContent('apple, cherry');
  },
};

export const PolymorphismAndState: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <Select.Root items={SELECT_ITEMS} defaultValue="apple">
      <Select.Trigger aria-label="Fruit" nativeButton={false} render={<div />}>
        <Select.Value />
      </Select.Trigger>
      <Select.Popup
        render={(props, state) => (
          <ul {...props} data-open-state={state.open} />
        )}
      >
        <Select.Item
          value="apple"
          render={<li />}
          startIcon={<IconCheck />}
          endIcon={<IconCheck />}
        >
          Apple
        </Select.Item>
        <Select.Item
          value="cherry"
          className={({ selected }) =>
            selected ? 'selected-consumer' : 'consumer'
          }
          style={({ highlighted }) => ({ outlineOffset: highlighted ? 7 : 3 })}
          render={(props, state) => (
            <li {...props} data-selected-state={state.selected} />
          )}
        >
          Cherry
        </Select.Item>
      </Select.Popup>
    </Select.Root>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await expect(trigger.tagName).toBe('DIV');
    await userEvent.click(trigger);
    const popup = await waitForSelectPopup(canvasElement);
    await expect(popup.tagName).toBe('UL');
    await expect(popup).toHaveAttribute('data-open-state', 'true');
    const cherry = within(popup).getByRole('option', { name: 'Cherry' });
    await expect(cherry.tagName).toBe('LI');
    await expect(cherry).toHaveClass('consumer');
    await userEvent.hover(cherry);
    await waitFor(() => expect(cherry).toHaveStyle({ outlineOffset: '7px' }));
    await userEvent.click(cherry);
    await waitFor(() => expect(popup).not.toBeVisible());
    await userEvent.click(trigger);
    const reopened = await waitForSelectPopup(canvasElement);
    await expect(
      within(reopened).getByRole('option', { name: 'Cherry' }),
    ).toHaveClass('selected-consumer');
    await expect(
      within(reopened).getByRole('option', { name: 'Cherry' }),
    ).toHaveAttribute('data-selected-state', 'true');
  },
};

export const SlotsAndTypeahead: Story = {
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  render: () => (
    <Select.Root items={SELECT_ITEMS} defaultValue="cherry">
      <Select.Trigger aria-label="Fruit">
        <Select.Value />
      </Select.Trigger>
      <Select.Popup>
        <Select.Item
          value="apple"
          description="Cherry alternative"
          descriptionPlacement="end"
          startIcon={<IconCheck />}
        >
          Apple
        </Select.Item>
        <Select.Item
          value="cherry"
          description="Seasonal"
          endIcon={<IconCheck />}
        >
          Cherry
        </Select.Item>
      </Select.Popup>
    </Select.Root>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    const popup = await waitForSelectPopup(canvasElement);
    const apple = within(popup).getByRole('option', {
      name: 'Apple Cherry alternative',
    });
    const cherry = within(popup).getByRole('option', {
      name: 'Cherry Seasonal',
    });
    await expect(apple).toHaveTextContent('Cherry alternative');
    await expect(cherry).toHaveTextContent('Seasonal');
    await userEvent.keyboard('{End}');
    await userEvent.keyboard('c');
    await expect(cherry).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(popup).not.toBeVisible());
    await expect(trigger).toHaveTextContent(/^Cherry$/);
  },
};

const ControlledMultipleExample = () => {
  const [value, setValue] = useState<string[]>(['apple']);

  return (
    <>
      <Select.Root
        multiple
        value={value}
        onValueChange={setValue}
        items={SELECT_ITEMS}
      >
        <Select.Trigger aria-label="Fruit">
          <Select.Value />
        </Select.Trigger>
        <Select.Popup>
          {SELECT_ITEMS.map(({ value: itemValue, label }) => (
            <Select.Item key={itemValue} value={itemValue}>
              {label}
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Root>
      <output aria-label="Selected values">{value.join(', ')}</output>
    </>
  );
};

export const ControlledMultiple: Story = {
  decorators: [ComponentDecorator],
  render: () => <ControlledMultipleExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox'));
    const popup = await waitForSelectPopup(canvasElement);
    await userEvent.click(
      within(popup).getByRole('option', { name: 'Cherry' }),
    );
    await expect(
      canvas.getByRole('status', { name: 'Selected values', hidden: true }),
    ).toHaveTextContent('apple, cherry');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeVisible());
    await expect(canvas.getByRole('combobox')).toHaveTextContent(
      'Apple, Cherry',
    );
  },
};

export const ClosedTypeahead: Story = {
  decorators: [ComponentDecorator],
  args: { defaultValue: 'apple' },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await userEvent.tab();
    await userEvent.keyboard('c');
    await expect(trigger).toHaveTextContent('Cherry');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Invalid: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <Field.Root invalid>
      <SelectExample defaultValue="apple" />
    </Field.Root>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await expect(trigger).toHaveAttribute('data-invalid');
    await expect(trigger).toHaveAttribute('aria-invalid', 'true');
    const invalidBorderColor = getComputedStyle(trigger).borderColor;
    await userEvent.click(trigger);
    await waitForSelectPopup(canvasElement);
    await expect(getComputedStyle(trigger).borderColor).toBe(
      invalidBorderColor,
    );
  },
};
