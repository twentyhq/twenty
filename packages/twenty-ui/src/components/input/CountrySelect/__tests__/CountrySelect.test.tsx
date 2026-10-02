import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { ThemeProvider } from '@ui/theme/ThemeProvider';

import { CountrySelect } from '../CountrySelect';

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

const FRANCE_CHOICE = { value: 'France', label: 'France' };

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
