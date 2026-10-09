import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createRef, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { IconCheck } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { Field } from '@ui/primitives/input/Field/Field';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { Select } from '../Select';
import { type SelectRootProps } from '../types/SelectRootProps';
import { SelectExample } from './SelectExample';
import { SELECT_ITEMS } from './selectItems';
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
      <Button type="button" onClick={() => setValue('cherry')}>
        Apply Cherry
      </Button>
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
      <Button type="button" onClick={() => setOpen(false)}>
        Apply closed state
      </Button>
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
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          align="start"
          sideOffset={8}
          alignItemWithTrigger={false}
        >
          <Select.Popup>
            <Select.Item value={{ id: 1, name: 'Ada' }}>
              <Select.ItemText>Ada</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
            <Select.Item value={{ id: 2, name: 'Grace' }}>
              <Select.ItemText>Grace</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
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
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner
              align="start"
              sideOffset={8}
              alignItemWithTrigger={false}
            >
              <Select.Popup>
                {SELECT_ITEMS.map(({ value, label }) => (
                  <Select.Item key={value} value={value}>
                    <Select.ItemText>{label}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
        <Field.Description>Choose fruit for delivery</Field.Description>
      </Field.Root>
      <Button type="submit">Submit</Button>
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
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          align="start"
          sideOffset={8}
          alignItemWithTrigger={false}
        >
          <Select.Popup
            render={(props, state) => (
              <ul {...props} data-open-state={state.open} />
            )}
          >
            <Select.Item value="apple" render={<li />}>
              <Select.ItemText>Apple</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
            <Select.Item
              value="cherry"
              className={({ selected }) =>
                selected ? 'selected-consumer' : 'consumer'
              }
              style={({ highlighted }) => ({
                outlineOffset: highlighted ? 7 : 3,
              })}
              render={(props, state) => (
                <li {...props} data-selected-state={state.selected} />
              )}
            >
              <Select.ItemText>Cherry</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
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

export const ItemCompositionAndTypeahead: Story = {
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  render: () => (
    <Select.Root items={SELECT_ITEMS} defaultValue="cherry">
      <Select.Trigger aria-label="Fruit">
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          align="start"
          sideOffset={8}
          alignItemWithTrigger={false}
        >
          <Select.Popup>
            <Select.Item value="apple">
              <IconCheck aria-hidden />
              <Select.ItemText>Apple</Select.ItemText>
              <span>Cherry alternative</span>
              <Select.ItemIndicator />
            </Select.Item>
            <Select.Item value="cherry">
              <Select.ItemText>Cherry</Select.ItemText>
              <span>Seasonal</span>
              <Select.ItemIndicator />
            </Select.Item>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
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
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            align="start"
            sideOffset={8}
            alignItemWithTrigger={false}
          >
            <Select.Popup>
              {SELECT_ITEMS.map(({ value: itemValue, label }) => (
                <Select.Item key={itemValue} value={itemValue}>
                  <Select.ItemText>{label}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
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

export const EmptyValues: Story = {
  decorators: [ComponentDecorator],
  args: { defaultValue: null, onValueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await expect(trigger).toHaveTextContent('Choose a fruit');
    await userEvent.click(trigger);
    const popup = await waitForSelectPopup(canvasElement);
    await expect(popup.querySelector('[aria-selected="true"]')).toBeNull();
    await userEvent.click(
      within(popup).getByRole('option', { name: 'Cherry' }),
    );
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      'cherry',
      expect.objectContaining({ reason: 'item-press' }),
    );
    await waitFor(() => expect(popup).not.toBeVisible());
    await expect(trigger).toHaveTextContent('Cherry');
  },
};

export const EmptyMultiple: Story = {
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { multiple: true, defaultValue: [], onValueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await expect(trigger).toHaveTextContent('Choose a fruit');
    await userEvent.click(trigger);
    const popup = await waitForSelectPopup(canvasElement);
    const cherry = within(popup).getByRole('option', { name: 'Cherry' });
    await userEvent.click(cherry);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      ['cherry'],
      expect.objectContaining({ reason: 'item-press' }),
    );
    await userEvent.click(cherry);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({ reason: 'item-press' }),
    );
    await expect(trigger).toHaveTextContent('Choose a fruit');
    await expect(popup).toBeVisible();
  },
};

const callbackValueChange =
  fn<NonNullable<SelectRootProps<string, boolean>['onValueChange']>>();
const callbackOpenChange =
  fn<NonNullable<SelectRootProps<string, boolean>['onOpenChange']>>();

export const CallbackDetails: Story = {
  decorators: [ComponentDecorator],
  args: {
    defaultValue: 'apple',
    onValueChange: callbackValueChange,
    onOpenChange: callbackOpenChange,
  },
  render: ({ onValueChange, ...args }) => (
    <SelectExample
      {...args}
      onValueChange={(value, details) => {
        if (value === 'cherry') {
          details.cancel();
        }
        details.allowPropagation();
        onValueChange?.(value, details);
      }}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await userEvent.click(trigger);
    const popup = await waitForSelectPopup(canvasElement);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({
        reason: 'trigger-press',
        event: expect.anything(),
        cancel: expect.anything(),
        allowPropagation: expect.anything(),
      }),
    );
    await expect(
      callbackOpenChange.mock.lastCall?.[1].event instanceof MouseEvent,
    ).toBe(true);
    await userEvent.click(
      within(popup).getByRole('option', { name: 'Cherry' }),
    );
    await expect(
      callbackValueChange.mock.lastCall?.[1].event instanceof MouseEvent,
    ).toBe(true);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      'cherry',
      expect.objectContaining({
        reason: 'item-press',
        event: expect.anything(),
        isCanceled: true,
        isPropagationAllowed: true,
      }),
    );
    await waitFor(() => expect(popup).not.toBeVisible());
    await expect(trigger).toHaveTextContent('Apple');
    await userEvent.click(trigger);
    await waitForSelectPopup(canvasElement);
    await userEvent.keyboard('{Escape}');
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({
        reason: 'escape-key',
        event: expect.anything(),
      }),
    );
    await expect(
      callbackOpenChange.mock.lastCall?.[1].event instanceof KeyboardEvent,
    ).toBe(true);
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

const triggerRef = createRef<HTMLButtonElement>();
const positionerRef = createRef<HTMLDivElement>();
const popupRef = createRef<HTMLDivElement>();
const itemTextRef = createRef<HTMLDivElement>();
const inputRef = createRef<HTMLInputElement>();

export const NativeCompositionAndRefs: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <Select.Root
      items={SELECT_ITEMS}
      defaultValue="apple"
      name="fruit"
      inputRef={inputRef}
    >
      <Select.Label>Fruit</Select.Label>
      <Select.Trigger ref={triggerRef} render={<Button />}>
        <Select.Value />
        <Select.Icon>
          <IconCheck />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Backdrop data-testid="select-backdrop" />
        <Select.Positioner
          ref={positionerRef}
          alignItemWithTrigger={false}
          align="start"
          sideOffset={8}
        >
          <Select.Popup ref={popupRef}>
            <Select.Item value="apple">
              <Select.ItemText ref={itemTextRef}>Apple</Select.ItemText>
              <Select.ItemIndicator>
                <IconCheck />
              </Select.ItemIndicator>
            </Select.Item>
            <Select.Item value="cherry">
              <Select.ItemText>Cherry</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox', {
      name: 'Fruit',
    });
    await expect(triggerRef.current).toBe(trigger);
    await expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    await expect(inputRef.current).toHaveAttribute('name', 'fruit');
    await expect(inputRef.current).toHaveValue('apple');
    await userEvent.click(trigger);
    const popup = await waitForSelectPopup(canvasElement);
    await expect(popupRef.current).toBe(popup);
    await expect(positionerRef.current).toContainElement(popup);
    await expect(itemTextRef.current).toHaveTextContent('Apple');
    await expect(
      within(canvasElement.ownerDocument.body).getByTestId('select-backdrop'),
    ).toBeVisible();
    await userEvent.click(
      within(popup).getByRole('option', { name: 'Cherry' }),
    );
    await waitFor(() => expect(popup).not.toBeVisible());
    await expect(trigger).toHaveTextContent('Cherry');
    await expect(inputRef.current).toHaveValue('cherry');
  },
};
