import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@ui/theme/ThemeProvider';

import { Select } from '../Select';
import { type SelectPositionerProps } from '../types/SelectPositionerProps';
import { type SelectRootProps } from '../types/SelectRootProps';

const ITEMS = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'beta', label: 'Beta' },
  { value: 'gamma', label: 'Gamma' },
];

const SelectOptions = () => (
  <Select.List>
    {ITEMS.map(({ value, label }) => (
      <Select.Item key={value} value={value}>
        <Select.ItemText>{label}</Select.ItemText>
        <Select.ItemIndicator />
      </Select.Item>
    ))}
  </Select.List>
);

const SelectContent = ({
  children = <SelectOptions />,
  positionerProps,
}: {
  children?: ReactNode;
  positionerProps?: SelectPositionerProps;
}) => (
  <Select.Portal>
    <Select.Positioner alignItemWithTrigger={false} {...positionerProps}>
      <Select.Popup>{children}</Select.Popup>
    </Select.Positioner>
  </Select.Portal>
);

const StringSelect = (props: SelectRootProps<string>) => (
  <Select.Root items={ITEMS} modal={false} {...props}>
    <Select.Label>Letter</Select.Label>
    <Select.Trigger>
      <Select.Value placeholder="Choose a letter" />
      <Select.Icon />
    </Select.Trigger>
    <SelectContent />
  </Select.Root>
);

const ThemedWrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider colorScheme="light">{children}</ThemeProvider>
);

describe('Select behavior', () => {
  it('updates an uncontrolled value and exposes native change details', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <StringSelect
        defaultValue="alpha"
        onValueChange={onValueChange}
        onOpenChange={onOpenChange}
      />,
      { wrapper: ThemedWrapper },
    );

    const trigger = screen.getByRole('combobox', { name: /Letter/ });

    expect(trigger).toHaveTextContent('Alpha');
    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({
        reason: 'trigger-press',
        event: expect.any(MouseEvent),
        cancel: expect.any(Function),
        allowPropagation: expect.any(Function),
      }),
    );

    await user.click(await screen.findByRole('option', { name: 'Beta' }));

    expect(onValueChange).toHaveBeenCalledWith(
      'beta',
      expect.objectContaining({
        reason: 'item-press',
        event: expect.any(MouseEvent),
        isCanceled: false,
        isPropagationAllowed: false,
      }),
    );
    expect(trigger).toHaveTextContent('Beta');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  });

  it('keeps a controlled value until the consumer updates it', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <StringSelect value="alpha" onValueChange={onValueChange} />,
      { wrapper: ThemedWrapper },
    );

    const trigger = screen.getByRole('combobox', { name: /Letter/ });

    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Beta' }));

    expect(onValueChange).toHaveBeenCalledWith('beta', expect.any(Object));
    expect(trigger).toHaveTextContent('Alpha');

    rerender(<StringSelect value="beta" onValueChange={onValueChange} />);

    expect(trigger).toHaveTextContent('Beta');
  });

  it('allows consumers to cancel a value change through event details', async () => {
    const user = userEvent.setup();

    render(
      <StringSelect
        defaultValue="alpha"
        onValueChange={(_value, details) => details.cancel()}
      />,
      { wrapper: ThemedWrapper },
    );

    const trigger = screen.getByRole('combobox', { name: /Letter/ });

    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Beta' }));

    expect(trigger).toHaveTextContent('Alpha');
  });

  it('distinguishes an empty string option from a null value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const emptyItems = [
      { value: '', label: 'Empty string' },
      { value: null, label: 'No value' },
      { value: 'alpha', label: 'Alpha' },
    ];

    render(
      <Select.Root
        defaultValue="alpha"
        items={emptyItems}
        onValueChange={onValueChange}
        modal={false}
      >
        <Select.Trigger aria-label="Optional letter">
          <Select.Value placeholder="Choose" />
        </Select.Trigger>
        <SelectContent>
          <Select.List>
            {emptyItems.map(({ value, label }) => (
              <Select.Item key={label} value={value}>
                <Select.ItemText>{label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.List>
        </SelectContent>
      </Select.Root>,
      { wrapper: ThemedWrapper },
    );

    const trigger = screen.getByRole('combobox', { name: 'Optional letter' });

    await user.click(trigger);
    await user.click(
      await screen.findByRole('option', { name: 'Empty string' }),
    );

    expect(onValueChange).toHaveBeenLastCalledWith('', expect.any(Object));
    expect(trigger).toHaveTextContent('Empty string');

    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'No value' }));

    expect(onValueChange).toHaveBeenLastCalledWith(null, expect.any(Object));
    expect(trigger).toHaveTextContent('No value');
    expect(trigger).toHaveAttribute('data-placeholder');
  });

  it('supports empty and populated multiple selections in native forms', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <form aria-label="Letter form">
        <Select.Root
          multiple
          defaultValue={[] as string[]}
          items={ITEMS}
          name="letters"
          onValueChange={onValueChange}
          modal={false}
        >
          <Select.Trigger aria-label="Letters">
            <Select.Value placeholder="Choose letters" />
          </Select.Trigger>
          <SelectContent />
        </Select.Root>
      </form>,
      { wrapper: ThemedWrapper },
    );

    const trigger = screen.getByRole('combobox', { name: 'Letters' });

    expect(trigger).toHaveTextContent('Choose letters');
    expect(
      new FormData(screen.getByRole<HTMLFormElement>('form')).getAll('letters'),
    ).toEqual([]);

    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Alpha' }));
    await user.click(await screen.findByRole('option', { name: 'Beta' }));

    expect(screen.getByRole('listbox')).toHaveAttribute(
      'aria-multiselectable',
      'true',
    );
    expect(onValueChange).toHaveBeenLastCalledWith(
      ['alpha', 'beta'],
      expect.objectContaining({ reason: 'item-press' }),
    );
    expect(
      new FormData(screen.getByRole<HTMLFormElement>('form')).getAll('letters'),
    ).toEqual(['alpha', 'beta']);

    await user.click(await screen.findByRole('option', { name: 'Alpha' }));

    expect(onValueChange).toHaveBeenLastCalledWith(
      ['beta'],
      expect.any(Object),
    );
  });

  it('prevents disabled root interaction', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<StringSelect disabled onOpenChange={onOpenChange} />, {
      wrapper: ThemedWrapper,
    });

    const trigger = screen.getByRole('combobox', { name: /Letter/ });

    expect(trigger).toBeDisabled();
    await user.click(trigger);

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('uses its accessible label and skips disabled options during keyboard navigation', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Select.Root onValueChange={onValueChange} items={ITEMS} modal={false}>
        <Select.Label>Keyboard letter</Select.Label>
        <Select.Trigger>
          <Select.Value placeholder="Choose" />
        </Select.Trigger>
        <SelectContent>
          <Select.List>
            <Select.Item value="alpha" disabled>
              <Select.ItemText>Alpha</Select.ItemText>
            </Select.Item>
            <Select.Item value="beta">
              <Select.ItemText>Beta</Select.ItemText>
            </Select.Item>
            <Select.Item value="gamma" label="Gamma">
              <Select.ItemText>Third letter</Select.ItemText>
            </Select.Item>
          </Select.List>
        </SelectContent>
      </Select.Root>,
      { wrapper: ThemedWrapper },
    );

    const trigger = screen.getByRole('combobox', { name: /Keyboard letter/ });

    trigger.focus();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'Alpha' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Beta' })).toHaveFocus(),
    );
    await user.keyboard('g');
    await waitFor(() =>
      expect(
        screen.getByRole('option', { name: 'Third letter' }),
      ).toHaveFocus(),
    );
    await user.keyboard('{Enter}');

    expect(onValueChange).toHaveBeenCalledWith(
      'gamma',
      expect.objectContaining({
        reason: 'item-press',
        event: expect.any(Event),
      }),
    );
    expect(trigger).toHaveTextContent('Gamma');
  });

  it('preserves object values, custom equality, input refs, and external native form ownership', () => {
    const selectedTeam = { identifier: 'sales', name: 'Sales team' };
    const inputRef = createRef<HTMLInputElement>();

    render(
      <>
        <form id="team-form" aria-label="Team form" />
        <Select.Root
          defaultValue={{ ...selectedTeam }}
          inputRef={inputRef}
          name="team"
          form="team-form"
          autoComplete="organization"
          required
          itemToStringLabel={(team) => team.name}
          itemToStringValue={(team) => team.identifier}
          isItemEqualToValue={(item, value) =>
            item.identifier === value.identifier
          }
          open
          modal={false}
        >
          <Select.Trigger aria-label="Team">
            <Select.Value />
          </Select.Trigger>
          <SelectContent>
            <Select.Item value={selectedTeam}>
              <Select.ItemText>Sales team</Select.ItemText>
            </Select.Item>
          </SelectContent>
        </Select.Root>
      </>,
      { wrapper: ThemedWrapper },
    );

    expect(screen.getByRole('combobox', { name: 'Team' })).toHaveTextContent(
      'Sales team',
    );
    expect(screen.getByRole('option', { name: 'Sales team' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    expect(inputRef.current).toHaveAttribute('autocomplete', 'organization');
    expect(inputRef.current).toBeRequired();
    expect(
      new FormData(screen.getByRole<HTMLFormElement>('form')).get('team'),
    ).toBe('sales');
  });

  it('keeps trigger and item content explicit and respects custom indicator children', () => {
    const triggerRef = createRef<HTMLButtonElement>();
    const itemRef = createRef<HTMLElement>();

    render(
      <Select.Root defaultValue="alpha" open modal={false}>
        <Select.Trigger
          ref={triggerRef}
          render={<button title="Custom trigger" />}
        >
          <span>Custom value</span>
          <Select.Icon>Custom icon</Select.Icon>
        </Select.Trigger>
        <SelectContent>
          <Select.Item
            ref={itemRef}
            value="alpha"
            nativeButton
            render={<button title="Custom option" />}
          >
            <span>Custom item</span>
            <Select.ItemIndicator>Selected marker</Select.ItemIndicator>
          </Select.Item>
        </SelectContent>
      </Select.Root>,
      { wrapper: ThemedWrapper },
    );

    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(triggerRef.current).toHaveAttribute('title', 'Custom trigger');
    expect(triggerRef.current?.children).toHaveLength(2);
    expect(triggerRef.current?.querySelector('svg')).toBeNull();
    expect(itemRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(itemRef.current).toHaveAttribute('title', 'Custom option');
    expect(itemRef.current?.children).toHaveLength(2);
    expect(itemRef.current).toHaveTextContent('Custom itemSelected marker');
    expect(itemRef.current?.querySelector('svg')).toBeNull();
  });

  it('keeps an inline popup and uses the upstream positioner defaults', () => {
    const positionerRef = createRef<HTMLDivElement>();
    const popupRef = createRef<HTMLDivElement>();
    const { container } = render(
      <Select.Root open modal={false}>
        <Select.Trigger aria-label="Inline select" />
        <Select.Positioner ref={positionerRef}>
          <Select.Popup ref={popupRef} />
        </Select.Positioner>
      </Select.Root>,
      { wrapper: ThemedWrapper },
    );

    expect(positionerRef.current).toBeInstanceOf(HTMLDivElement);
    expect(positionerRef.current).toHaveAttribute('data-side', 'none');
    expect(positionerRef.current).toHaveAttribute('data-align', 'center');
    expect(popupRef.current?.parentElement).toBe(positionerRef.current);
    expect(container).toContainElement(popupRef.current);
  });

  it('passes advanced positioning and offset functions to the positioner', async () => {
    const positionerRef = createRef<HTMLDivElement>();
    const sideOffset = vi.fn(() => 18);
    const alignOffset = vi.fn(() => 7);

    render(
      <Select.Root open modal={false}>
        <Select.Trigger aria-label="Positioned select" />
        <SelectContent
          positionerProps={{
            ref: positionerRef,
            alignItemWithTrigger: false,
            side: 'right',
            align: 'end',
            positionMethod: 'fixed',
            sideOffset,
            alignOffset,
            collisionAvoidance: { side: 'none', align: 'none' },
            collisionPadding: { top: 12, bottom: 8 },
            arrowPadding: 9,
            sticky: true,
            disableAnchorTracking: true,
          }}
        />
      </Select.Root>,
      { wrapper: ThemedWrapper },
    );

    await waitFor(() => {
      expect(positionerRef.current).toHaveAttribute('data-side', 'right');
      expect(positionerRef.current).toHaveAttribute('data-align', 'end');
      expect(positionerRef.current).toHaveStyle({ position: 'fixed' });
      expect(sideOffset).toHaveBeenCalledWith(
        expect.objectContaining({ side: 'right', align: 'end' }),
      );
      expect(alignOffset).toHaveBeenCalledWith(
        expect.objectContaining({ side: 'right', align: 'end' }),
      );
    });
  });

  it('keeps scoped theme portaling and explicit portal containers', () => {
    const portalContainerRef = createRef<HTMLDivElement>();
    const scopedPopupRef = createRef<HTMLDivElement>();
    const customPopupRef = createRef<HTMLDivElement>();

    render(
      <>
        <div ref={portalContainerRef} data-testid="portal-container" />
        <ThemeProvider
          colorScheme="dark"
          applyToRoot={false}
          className="select-theme"
        >
          <Select.Root open modal={false}>
            <Select.Trigger aria-label="Scoped select" />
            <Select.Portal>
              <Select.Positioner alignItemWithTrigger={false}>
                <Select.Popup ref={scopedPopupRef} />
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
          <Select.Root open modal={false}>
            <Select.Trigger aria-label="Custom container select" />
            <Select.Portal container={portalContainerRef}>
              <Select.Positioner alignItemWithTrigger={false}>
                <Select.Popup ref={customPopupRef} />
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </ThemeProvider>
      </>,
    );

    expect(scopedPopupRef.current?.closest('.select-theme')).toHaveClass(
      'dark',
    );
    expect(screen.getByTestId('portal-container')).toContainElement(
      customPopupRef.current,
    );
  });
});
