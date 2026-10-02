import { type ReactNode } from 'react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';

import { CurrencyPicker } from '../CurrencyPicker';
import styles from '../CurrencyPicker.module.scss';

const CurrencyPickerTriggerWrapper = ({
  children,
}: {
  children: ReactNode;
}) => <Dropdown.Root type="picker">{children}</Dropdown.Root>;

const CurrencyPickerOptionsWrapper = ({
  children,
}: {
  children: ReactNode;
}) => (
  <Dropdown.Root type="picker" open>
    <Dropdown.Content aria-label="Currency">{children}</Dropdown.Content>
  </Dropdown.Root>
);

runComponentConformance({
  name: 'CurrencyPicker.Trigger',
  element: <CurrencyPicker.Trigger value="USD" aria-label="Currency" />,
  refInstanceOf: HTMLButtonElement,
  wrapper: CurrencyPickerTriggerWrapper,
  ownClassName: styles.trigger,
  renderPropTagName: 'button',
});

runComponentConformance({
  name: 'CurrencyPicker.Options',
  element: (
    <CurrencyPicker.Options
      currencies={[{ code: 'USD', name: 'US Dollar' }]}
      value="USD"
      onValueChange={() => undefined}
    />
  ),
  refInstanceOf: HTMLDivElement,
  wrapper: CurrencyPickerOptionsWrapper,
  ownClassName: styles.options,
  renderPropTagName: 'div',
});
