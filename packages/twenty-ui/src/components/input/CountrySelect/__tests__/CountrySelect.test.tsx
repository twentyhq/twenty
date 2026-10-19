import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { render, screen } from '@testing-library/react';
import { createRef, type ReactNode } from 'react';
import { expect, it } from 'vitest';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { ThemeProvider } from '@ui/theme/ThemeProvider';

import { CountrySelect } from '../CountrySelect';

const FRANCE_CHOICE = { value: 'FR', label: 'France' };

const CountrySelectWrapper = ({ children }: { children: ReactNode }) => (
  <CountrySelect.Root countries={[FRANCE_CHOICE]} value="FR">
    <Dropdown.Root type="picker">{children}</Dropdown.Root>
  </CountrySelect.Root>
);

runComponentConformance({
  name: 'CountrySelect',
  element: (
    <CountrySelect
      countries={[{ value: 'France', label: 'France' }]}
      value="France"
      onValueChange={() => undefined}
    />
  ),
  refInstanceOf: HTMLButtonElement,
  renderPropTagName: 'button',
});

runComponentConformance({
  name: 'CountrySelect.Trigger',
  element: <CountrySelect.Trigger aria-label="Country" />,
  wrapper: CountrySelectWrapper,
  refInstanceOf: HTMLButtonElement,
  renderPropTagName: 'button',
});

runComponentConformance({
  name: 'CountrySelect.Options',
  element: <CountrySelect.Options aria-label="Countries" />,
  wrapper: CountrySelectWrapper,
  refInstanceOf: HTMLDivElement,
  renderPropTagName: 'div',
});

it.each([
  { value: 'FR', expectedValue: 'FR' },
  { value: null, expectedValue: 'null' },
])(
  'exposes the public selected identifier $value to Options render',
  ({ value, expectedValue }) => {
    render(
      <ThemeProvider colorScheme="light">
        <CountrySelect.Root countries={[FRANCE_CHOICE]} value={value}>
          <Dropdown.Root type="picker">
            <CountrySelect.Options
              render={(renderProps, state) => (
                <div
                  // oxlint-disable-next-line react/jsx-props-no-spreading
                  {...renderProps}
                  data-selected-value={String(state.value)}
                  data-multiple={String(state.multiple)}
                />
              )}
            />
          </Dropdown.Root>
        </CountrySelect.Root>
      </ThemeProvider>,
    );

    expect(screen.getByRole('listbox')).toHaveAttribute(
      'data-selected-value',
      expectedValue,
    );
    expect(screen.getByRole('listbox')).toHaveAttribute(
      'data-multiple',
      'false',
    );
  },
);

it.each([
  {
    value: null,
    expectedLabel: 'No country',
    unselectedLabel: 'Empty identifier',
  },
  {
    value: '',
    expectedLabel: 'Empty identifier',
    unselectedLabel: 'No country',
  },
])(
  'distinguishes $value from an actual empty-string country identifier',
  ({ value, expectedLabel, unselectedLabel }) => {
    render(
      <ThemeProvider colorScheme="light">
        <CountrySelect.Root
          countries={[FRANCE_CHOICE, { value: '', label: 'Empty identifier' }]}
          value={value}
        >
          <Dropdown.Root type="picker">
            <CountrySelect.Trigger aria-label="Country" />
            <CountrySelect.Options />
          </Dropdown.Root>
        </CountrySelect.Root>
      </ThemeProvider>,
    );

    expect(screen.getByRole('button', { name: 'Country' })).toHaveTextContent(
      expectedLabel,
    );
    expect(screen.getByRole('option', { name: expectedLabel })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByRole('option', { name: unselectedLabel }),
    ).toHaveAttribute('aria-selected', 'false');
  },
);

it('keeps wrapper customization and refs separate from the native shorthand trigger', () => {
  const wrapperRef = createRef<HTMLDivElement>();
  const triggerRef = createRef<HTMLButtonElement>();

  render(
    <ThemeProvider colorScheme="light">
      <CountrySelect
        countries={[FRANCE_CHOICE]}
        defaultValue="FR"
        aria-label="Country"
        name="country"
        title="Choose country"
        className="country-trigger"
        style={{ minWidth: 200 }}
        ref={triggerRef}
        wrapperProps={{
          id: 'country-wrapper',
          className: 'country-wrapper',
          style: { maxWidth: 320 },
          ref: wrapperRef,
        }}
      />
    </ThemeProvider>,
  );

  const trigger = screen.getByRole('button', { name: 'Country' });

  expect(triggerRef.current).toBe(trigger);
  expect(trigger).toHaveAttribute('name', 'country');
  expect(trigger).toHaveAttribute('title', 'Choose country');
  expect(trigger).toHaveClass('country-trigger');
  expect(trigger).toHaveStyle({ minWidth: '200px' });
  expect(wrapperRef.current).toBe(trigger.parentElement);
  expect(wrapperRef.current).toHaveAttribute('id', 'country-wrapper');
  expect(wrapperRef.current).toHaveClass('country-wrapper');
  expect(wrapperRef.current).toHaveStyle({ maxWidth: '320px' });
  expect(wrapperRef.current).not.toHaveAttribute('name');
  expect(wrapperRef.current).not.toHaveAttribute('aria-label');
});

it.each([
  {
    availability: 'enabled',
    disabled: false,
    countries: [FRANCE_CHOICE],
    expectedDisabled: false,
  },
  {
    availability: 'disabled',
    disabled: true,
    countries: [FRANCE_CHOICE],
    expectedDisabled: true,
  },
  {
    availability: 'unavailable',
    disabled: false,
    countries: [],
    expectedDisabled: true,
  },
])(
  'passes the $availability state to trigger state callbacks',
  ({ disabled, countries, expectedDisabled }) => {
    render(
      <ThemeProvider colorScheme="light">
        <CountrySelect
          countries={countries}
          value=""
          onValueChange={() => undefined}
          aria-label="Country"
          disabled={disabled}
          className={(state) =>
            state.disabled ? 'trigger-disabled' : 'trigger-enabled'
          }
          style={(state) => ({ opacity: state.disabled ? 0.5 : 1 })}
          render={(renderProps, state) => (
            <button
              // oxlint-disable-next-line react/jsx-props-no-spreading
              {...renderProps}
              data-state-disabled={String(state.disabled)}
            />
          )}
        />
      </ThemeProvider>,
    );

    const trigger = screen.getByRole('button', { name: 'Country' });

    expect(trigger).toHaveClass(
      expectedDisabled ? 'trigger-disabled' : 'trigger-enabled',
    );
    expect(trigger).toHaveStyle({ opacity: expectedDisabled ? '0.5' : '1' });
    expect(trigger).toHaveAttribute(
      'data-state-disabled',
      String(expectedDisabled),
    );
  },
);
