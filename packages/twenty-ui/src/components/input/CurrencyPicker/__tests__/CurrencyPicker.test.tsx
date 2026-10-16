import { type ReactNode } from 'react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';

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
