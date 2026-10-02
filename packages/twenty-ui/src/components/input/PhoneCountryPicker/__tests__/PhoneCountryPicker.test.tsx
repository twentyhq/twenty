import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';

import { PhoneCountryPicker } from '../PhoneCountryPicker';
import styles from '../PhoneCountryPicker.module.scss';

const PhoneCountryPickerWrapper = ({ children }: { children: ReactNode }) => (
  <Dropdown.Root type="picker">{children}</Dropdown.Root>
);

runComponentConformance({
  name: 'PhoneCountryPicker.Trigger',
  element: <PhoneCountryPicker.Trigger aria-label="Phone country" />,
  refInstanceOf: HTMLButtonElement,
  wrapper: PhoneCountryPickerWrapper,
  ownClassName: styles.trigger,
  skip: ['renderProp'],
});

describe('PhoneCountryPicker.Trigger', () => {
  it('preserves native button attributes and the accessible name with a decorative flag', () => {
    render(
      <PhoneCountryPickerWrapper>
        <PhoneCountryPicker.Trigger
          aria-label="Phone country"
          name="phone-country"
          value="CA"
          country={{
            value: 'CA',
            label: 'Canada',
            callingCode: '1',
            flag: <svg role="img" aria-label="Canada flag" />,
          }}
        />
      </PhoneCountryPickerWrapper>,
    );

    const trigger = screen.getByRole('button', { name: 'Phone country' });

    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('name', 'phone-country');
    expect(trigger).toHaveAttribute('value', 'CA');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
