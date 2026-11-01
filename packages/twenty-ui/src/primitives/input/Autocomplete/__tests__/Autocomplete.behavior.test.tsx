import { type Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { expectTypeOf, vi } from 'vitest';

import {
  Autocomplete,
  type AutocompleteRootChangeEventDetails,
  type AutocompleteRootProps,
  Field,
} from '@ui/primitives/input';
import { DirectionProvider } from '@ui/primitives/layout';
import { ThemeProvider } from '@ui/theme';

const FRUITS = ['Apple', 'Banana', 'Cherry'];
const FruitSearch = (props: Omit<AutocompleteRootProps<string>, 'items'>) => (
  <Autocomplete.Root items={FRUITS} autoHighlight="always" {...props}>
    <Autocomplete.Input aria-label="Fruit" />
    <Autocomplete.Portal>
      <Autocomplete.Positioner>
        <Autocomplete.Popup>
          <Autocomplete.Empty>No fruit found</Autocomplete.Empty>
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
);
const ControlledSearch = () => {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  return (
    <>
      <FruitSearch
        value={value}
        open={open}
        onValueChange={setValue}
        onOpenChange={setOpen}
      />
      <button onClick={() => setValue('Cherry')}>Use cherry</button>
    </>
  );
};

describe('Autocomplete public contract', () => {
  it('preserves installed Root overloads and generic prop contracts', () => {
    expectTypeOf(Autocomplete.Root).toEqualTypeOf<
      typeof AutocompletePrimitive.Root
    >();
    expectTypeOf<AutocompleteRootProps<{ title: string }>>().toEqualTypeOf<
      AutocompletePrimitive.Root.Props<{ title: string }>
    >();
  });

  it('filters string items and exposes the upstream empty state', async () => {
    const user = userEvent.setup();
    render(<FruitSearch />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await user.type(input, 'ban');
    expect(await screen.findByRole('option', { name: 'Banana' })).toBeVisible();
    expect(screen.queryByRole('option', { name: 'Apple' })).toBeNull();
    await user.clear(input);
    await user.type(input, 'missing');
    expect(await screen.findByText('No fruit found')).toBeVisible();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('infers grouped object items and forwards highlight values', async () => {
    const user = userEvent.setup();
    const onItemHighlighted = vi.fn();
    const groups = [
      {
        title: 'Produce',
        items: [
          { code: 'a', title: 'Apple' },
          { code: 'b', title: 'Banana' },
        ],
      },
    ];
    render(
      <Autocomplete.Root
        items={groups}
        itemToStringValue={(item) => item.title}
        autoHighlight="always"
        onItemHighlighted={(item, details) =>
          onItemHighlighted(item?.code, details)
        }
      >
        <Autocomplete.Input aria-label="Produce" />
        <Autocomplete.Portal>
          <Autocomplete.Positioner>
            <Autocomplete.Popup>
              <Autocomplete.List>
                {(group: (typeof groups)[number]) => (
                  <Autocomplete.Group key={group.title} items={group.items}>
                    <Autocomplete.GroupLabel>
                      {group.title}
                    </Autocomplete.GroupLabel>
                    <Autocomplete.Collection>
                      {(item: (typeof groups)[number]['items'][number]) => (
                        <Autocomplete.Item key={item.code} value={item}>
                          {item.title}
                        </Autocomplete.Item>
                      )}
                    </Autocomplete.Collection>
                  </Autocomplete.Group>
                )}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      </Autocomplete.Root>,
    );
    await user.type(screen.getByRole('combobox', { name: 'Produce' }), 'ban');
    expect(await screen.findByRole('option', { name: 'Banana' })).toBeVisible();
    expect(onItemHighlighted).toHaveBeenCalledWith(
      'b',
      expect.objectContaining({ reason: expect.any(String) }),
    );
    await user.keyboard('{Enter}');
    expect(screen.getByRole('combobox', { name: 'Produce' })).toHaveValue(
      'Banana',
    );
  });

  it('uses upstream object labels without requiring a custom item shape', async () => {
    const user = userEvent.setup();
    const item = { value: 'a', label: 'Apple', extra: 42 };
    render(
      <Autocomplete.Root items={[item]} autoHighlight="always">
        <Autocomplete.Input aria-label="Label" />
        <Autocomplete.Portal>
          <Autocomplete.Positioner>
            <Autocomplete.Popup>
              <Autocomplete.List>
                {(fruit: typeof item) => (
                  <Autocomplete.Item value={fruit}>
                    {fruit.label}
                  </Autocomplete.Item>
                )}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      </Autocomplete.Root>,
    );
    await user.type(screen.getByRole('combobox', { name: 'Label' }), 'app');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('combobox', { name: 'Label' })).toHaveValue(
      'Apple',
    );
  });

  it('retains controlled input and popup updates', async () => {
    const user = userEvent.setup();
    render(<ControlledSearch />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await user.type(input, 'ban');
    expect(input).toHaveValue('ban');
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('Banana');
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-expanded', 'false'),
    );
    await user.click(screen.getByRole('button', { name: 'Use cherry' }));
    expect(input).toHaveValue('Cherry');
  });

  it('delivers native change details and cancellable dismissal', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn(
      (open: boolean, details: AutocompleteRootChangeEventDetails) => {
        if (!open) details.cancel();
      },
    );
    render(
      <FruitSearch onValueChange={onValueChange} onOpenChange={onOpenChange} />,
    );
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await user.type(input, 'b');
    expect(onValueChange).toHaveBeenCalledWith(
      'b',
      expect.objectContaining({
        reason: 'input-change',
        event: expect.any(Event),
        cancel: expect.any(Function),
      }),
    );
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({
        reason: 'escape-key',
        isCanceled: true,
        event: expect.any(KeyboardEvent),
      }),
    );
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('allows the dismissing outside click to activate its target', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <>
        <FruitSearch onOpenChange={onOpenChange} />
        <button onClick={onClick}>Outside action</button>
      </>,
    );
    const outsideAction = screen.getByRole('button', {
      name: 'Outside action',
    });
    await user.type(screen.getByRole('combobox', { name: 'Fruit' }), 'a');
    await screen.findByRole('option', { name: 'Apple' });
    await user.click(outsideAction);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'outside-press', isCanceled: false }),
    );
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('preserves Field naming and native form submission/reset', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    render(
      <form aria-label="Search form">
        <Field.Root name="fruit">
          <Field.Label>Named fruit</Field.Label>
          <Autocomplete.Root defaultValue="Apple" required>
            <Autocomplete.Input ref={ref} />
          </Autocomplete.Root>
          <Field.Description>Choose produce</Field.Description>
        </Field.Root>
      </form>,
    );
    const form = screen.getByRole<HTMLFormElement>('form', {
      name: 'Search form',
    });
    const input = screen.getByRole('combobox', { name: 'Named fruit' });
    expect(input).toHaveAccessibleDescription('Choose produce');
    expect(Object.fromEntries(new FormData(form))).toEqual({ fruit: 'Apple' });
    await user.clear(input);
    expect(ref.current?.checkValidity()).toBe(false);
    await user.type(input, 'Banana');
    expect(Object.fromEntries(new FormData(form))).toEqual({ fruit: 'Banana' });
    form.reset();
    await waitFor(() => expect(input).toHaveValue('Banana'));
  });

  it('does not confirm a highlighted item during IME confirmation', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FruitSearch onValueChange={onValueChange} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await user.type(input, 'a');
    await screen.findByRole('option', { name: 'Apple' });
    onValueChange.mockClear();
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      keyCode: 229,
      which: 229,
      isComposing: true,
    });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('a');
    fireEvent.compositionEnd(input, { data: 'a' });
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('Apple');
  });

  it('preserves scoped portal direction, explicit targets and null containers', () => {
    const target = document.createElement('div');
    document.body.append(target);
    const { rerender, unmount } = render(
      <DirectionProvider direction="rtl">
        <ThemeProvider
          colorScheme="dark"
          applyToRoot={false}
          className="search-scope"
        >
          <Autocomplete.Root open>
            <Autocomplete.Input aria-label="Scoped" />
            <Autocomplete.Portal data-testid="portal">
              <Autocomplete.Positioner data-testid="positioner">
                <Autocomplete.Popup>Options</Autocomplete.Popup>
              </Autocomplete.Positioner>
            </Autocomplete.Portal>
          </Autocomplete.Root>
        </ThemeProvider>
      </DirectionProvider>,
    );
    expect(
      screen.getByTestId('portal').closest('.search-scope'),
    ).not.toBeNull();
    expect(screen.getByTestId('portal')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByTestId('positioner')).toHaveAttribute('dir', 'rtl');
    rerender(
      <Autocomplete.Root open>
        <Autocomplete.Input aria-label="Explicit" />
        <Autocomplete.Portal container={target} dir="ltr" data-testid="portal">
          <Autocomplete.Positioner dir="ltr">
            <Autocomplete.Popup>Options</Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      </Autocomplete.Root>,
    );
    expect(screen.getByTestId('portal').parentElement).toBe(target);
    expect(screen.getByTestId('portal')).toHaveAttribute('dir', 'ltr');
    rerender(
      <Autocomplete.Root open>
        <Autocomplete.Input aria-label="Hidden" />
        <Autocomplete.Portal container={null}>
          <Autocomplete.Positioner>
            <Autocomplete.Popup>Hidden options</Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      </Autocomplete.Root>,
    );
    expect(screen.queryByText('Hidden options')).toBeNull();
    unmount();
    target.remove();
  });
});
