import { render, screen } from '@testing-library/react';
import { createRef, type ReactNode } from 'react';
import { expect, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ThemeProvider } from '@ui/theme/ThemeProvider';

import { CurrencyPicker } from '../CurrencyPicker';
import styles from '../CurrencyPicker.module.scss';

const CURRENCIES = [{ code: 'USD', name: 'US Dollar' }];

const CurrencyPickerTriggerWrapper = ({
  children,
}: {
  children: ReactNode;
}) => (
  <Dropdown.Root type="picker">
    <CurrencyPicker.Root currencies={CURRENCIES} defaultValue="USD">
      {children}
    </CurrencyPicker.Root>
  </Dropdown.Root>
);

const CurrencyPickerOptionsWrapper = ({
  children,
}: {
  children: ReactNode;
}) => (
  <Dropdown.Root type="picker" open>
    <CurrencyPicker.Root currencies={CURRENCIES} defaultValue="USD">
      <Dropdown.Content aria-label="Currency">{children}</Dropdown.Content>
    </CurrencyPicker.Root>
  </Dropdown.Root>
);

runComponentConformance({
  name: 'CurrencyPicker',
  element: (
    <CurrencyPicker
      currencies={CURRENCIES}
      defaultValue="USD"
      aria-label="Currency"
    />
  ),
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.trigger,
  renderPropTagName: 'button',
});

runComponentConformance({
  name: 'CurrencyPicker.Trigger',
  element: <CurrencyPicker.Trigger aria-label="Currency" />,
  refInstanceOf: HTMLButtonElement,
  wrapper: CurrencyPickerTriggerWrapper,
  ownClassName: styles.trigger,
  renderPropTagName: 'button',
});

runComponentConformance({
  name: 'CurrencyPicker.Options',
  element: <CurrencyPicker.Options />,
  refInstanceOf: HTMLDivElement,
  wrapper: CurrencyPickerOptionsWrapper,
  ownClassName: styles.options,
  renderPropTagName: 'div',
});

it.each([
  { value: 'USD', expectedLabel: 'USD' },
  { value: 'ZZZ', expectedLabel: 'ZZZ' },
  { value: '', expectedLabel: '' },
  { value: null, expectedLabel: 'Choose currency' },
])(
  'preserves the $value identifier in the trigger',
  ({ value, expectedLabel }) => {
    render(
      <ThemeProvider colorScheme="light">
        <CurrencyPicker
          currencies={CURRENCIES}
          value={value}
          aria-label="Currency"
          placeholder="Choose currency"
        />
      </ThemeProvider>,
    );

    expect(screen.getByRole('button', { name: 'Currency' }).textContent).toBe(
      expectedLabel,
    );
  },
);

it('exposes prepared Root state without adding a DOM wrapper', () => {
  const { container } = render(
    <ThemeProvider colorScheme="light">
      <Dropdown.Root type="picker">
        <CurrencyPicker.Root currencies={CURRENCIES} value="USD" disabled>
          {({ value, selectedCurrency, disabled }) => (
            <Text data-testid="root-state">
              {value}:{selectedCurrency?.name}:{String(disabled)}
            </Text>
          )}
        </CurrencyPicker.Root>
      </Dropdown.Root>
    </ThemeProvider>,
  );

  const rootState = screen.getByTestId('root-state');

  expect(rootState).toHaveTextContent('USD:US Dollar:true');
  expect(container.children).toHaveLength(1);
  expect(container.firstElementChild).toBe(rootState);
});

it('keeps native trigger props separate from options, search, and popup props', () => {
  const searchRef = createRef<HTMLInputElement>();

  render(
    <ThemeProvider colorScheme="light">
      <CurrencyPicker
        currencies={CURRENCIES}
        defaultValue="USD"
        open
        title="Top level trigger title"
        triggerProps={{ title: 'Trigger title', 'aria-label': 'Currency' }}
        optionsProps={{
          title: 'Options title',
          searchProps: {
            ref: searchRef,
            title: 'Search title',
            'aria-label': 'Find a currency',
            render: <input data-search-render="native" />,
          },
        }}
        contentProps={{
          'aria-label': 'Available currencies',
          title: 'Popup title',
        }}
      />
    </ThemeProvider>,
  );

  expect(screen.getByRole('button', { name: 'Currency' })).toHaveAttribute(
    'title',
    'Trigger title',
  );
  expect(screen.getByTitle('Options title').tagName).toBe('DIV');
  const search = screen.getByRole('searchbox', { name: 'Find a currency' });

  expect(search).toHaveAttribute('title', 'Search title');
  expect(search).toHaveAttribute('data-search-render', 'native');
  expect(searchRef.current).toBe(search);
  expect(
    screen.getByRole('dialog', { name: 'Available currencies' }),
  ).toHaveAttribute('title', 'Popup title');
});

it.each(['shorthand', 'compound'] as const)(
  'retains the initial uncontrolled identifier in %s before Options mount',
  (composition) => {
    const renderPicker = ({ defaultValue }: { defaultValue: string }) => (
      <ThemeProvider colorScheme="light">
        {composition === 'shorthand' ? (
          <CurrencyPicker
            currencies={CURRENCIES}
            defaultValue={defaultValue}
            aria-label="Currency"
          />
        ) : (
          <Dropdown.Root type="picker">
            <CurrencyPicker.Root
              currencies={CURRENCIES}
              defaultValue={defaultValue}
            >
              <CurrencyPicker.Trigger aria-label="Currency" />
            </CurrencyPicker.Root>
          </Dropdown.Root>
        )}
      </ThemeProvider>
    );
    const { rerender } = render(renderPicker({ defaultValue: 'USD' }));

    expect(screen.getByRole('button', { name: 'Currency' })).toHaveTextContent(
      'USD',
    );
    rerender(renderPicker({ defaultValue: 'EUR' }));
    expect(screen.getByRole('button', { name: 'Currency' })).toHaveTextContent(
      'USD',
    );
  },
);
