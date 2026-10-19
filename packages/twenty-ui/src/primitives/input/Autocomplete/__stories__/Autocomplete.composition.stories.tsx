import { type Meta, type StoryObj } from '@storybook/react-vite';
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';

import inputStyles from '@ui/primitives/input/Input/Input.module.scss';
import { ComponentDecorator } from '@ui/testing';

import { Autocomplete } from '../Autocomplete';
import { type AutocompleteRootProps } from '../types/AutocompleteRootProps';
import { AutocompleteExample } from './AutocompleteExample';

const meta: Meta<typeof AutocompleteExample> = {
  title: 'UI/Input/Autocomplete/Composition',
  component: AutocompleteExample,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 280, height: 260 } },
};

export default meta;
type Story = StoryObj<typeof AutocompleteExample>;

export const CallbackDetails: Story = {
  args: {
    onValueChange: fn(),
    onOpenChange: fn(),
    onItemHighlighted: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('combobox', {
      name: 'Fruit',
    });
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.type(input, 'Ch');
    const cherry = await body.findByRole('option', { name: 'Cherry' });
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-activedescendant', cherry.id),
    );
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      'Ch',
      expect.objectContaining({
        reason: 'input-change',
        event: expect.objectContaining({ type: 'input', target: input }),
        cancel: expect.anything(),
        allowPropagation: expect.anything(),
        isCanceled: false,
      }),
    );
    await expect(args.onItemHighlighted).toHaveBeenCalledWith(
      'Cherry',
      expect.objectContaining({ reason: 'none' }),
    );
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Cherry');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      'Cherry',
      expect.objectContaining({
        reason: 'item-press',
        event: expect.objectContaining({ type: 'keydown', target: input }),
      }),
    );
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'item-press' }),
    );
  },
};

export const CompositionConfirmation: Story = {
  args: { onValueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('combobox', {
      name: 'Fruit',
    });
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(input);
    await fireEvent.compositionStart(input);
    await fireEvent.input(input, {
      target: { value: 'Ch' },
      inputType: 'insertCompositionText',
      isComposing: true,
    });
    await body.findByRole('listbox');
    const apple = body.getByRole('option', { name: 'Apple' });
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-activedescendant', apple.id),
    );
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      keyCode: 229,
      which: 229,
      isComposing: true,
    });
    await expect(input).toHaveValue('Ch');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await fireEvent.compositionEnd(input, { data: 'Ch' });
    const cherry = await body.findByRole('option', { name: 'Cherry' });
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-activedescendant', cherry.id),
    );
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      'Ch',
      expect.objectContaining({
        reason: 'input-change',
        event: expect.objectContaining({
          type: 'compositionend',
          target: input,
        }),
      }),
    );
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Cherry');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  },
};

export const CancelledDismissal: Story = {
  args: {
    onOpenChange: fn<
      NonNullable<AutocompleteRootProps<string>['onOpenChange']>
    >((_nextOpen, details) => {
      if (details.reason === 'escape-key') {
        details.cancel();
      }
    }),
  },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('combobox', {
      name: 'Fruit',
    });
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.type(input, 'Ch');
    await body.findByRole('option', { name: 'Cherry' });
    await waitFor(() => expect(body.getByRole('listbox')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({
        reason: 'escape-key',
        event: expect.objectContaining({ type: 'keydown', target: input }),
        isCanceled: true,
        isPropagationAllowed: false,
      }),
    );
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(input).toHaveFocus();
    await expect(body.getByRole('listbox')).toBeVisible();
  },
};

export const ComposedInputAppearance: Story = {
  render: () => (
    <>
      <AutocompleteExample />
      <Autocomplete.Root
        items={['Apple', 'Banana', 'Cherry']}
        autoHighlight="always"
      >
        <Autocomplete.Input aria-label="Composed fruit" render={<input />} />
        <Autocomplete.Portal>
          <Autocomplete.Positioner>
            <Autocomplete.Popup>
              <Autocomplete.List>
                {(fruit: string) => (
                  <Autocomplete.Item key={fruit} value={fruit}>
                    {fruit}
                  </Autocomplete.Item>
                )}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      </Autocomplete.Root>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const defaultInput = canvas.getByRole('combobox', { name: 'Fruit' });
    const composedInput = canvas.getByRole('combobox', {
      name: 'Composed fruit',
    });

    await expect(defaultInput).toHaveClass(inputStyles.input, inputStyles.md);
    await expect(composedInput).not.toHaveClass(inputStyles.input);
    await expect(composedInput).not.toHaveClass(inputStyles.md);

    await userEvent.type(composedInput, 'Ch');
    const cherry = await body.findByRole('option', { name: 'Cherry' });
    await waitFor(() =>
      expect(composedInput).toHaveAttribute('aria-activedescendant', cherry.id),
    );
    await expect(composedInput).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(composedInput).toHaveValue('Cherry');
    await expect(composedInput).toHaveFocus();
    await waitFor(() =>
      expect(body.queryByRole('listbox')).not.toBeInTheDocument(),
    );
  },
};
