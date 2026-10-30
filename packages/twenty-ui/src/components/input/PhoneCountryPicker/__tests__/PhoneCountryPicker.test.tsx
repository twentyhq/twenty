import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';

import { PhoneCountryPicker } from '../PhoneCountryPicker';
import styles from '../PhoneCountryPicker.module.scss';
import { PHONE_COUNTRY_OPTIONS } from '../__stories__/phoneCountryOptions';

const PhoneCountryPickerWrapper = ({ children }: { children: ReactNode }) => (
  <PhoneCountryPicker.Root countries={PHONE_COUNTRY_OPTIONS} defaultValue="FR">
    <Dropdown.Root type="picker">{children}</Dropdown.Root>
  </PhoneCountryPicker.Root>
);

const PhoneCountryPickerOptionsWrapper = ({
  children,
}: {
  children: ReactNode;
}) => (
  <PhoneCountryPicker.Root countries={PHONE_COUNTRY_OPTIONS} defaultValue="FR">
    <Dropdown.Root type="picker" open>
      <Dropdown.Content aria-label="Phone country">{children}</Dropdown.Content>
    </Dropdown.Root>
  </PhoneCountryPicker.Root>
);

runComponentConformance({
  name: 'PhoneCountryPicker',
  element: (
    <PhoneCountryPicker
      countries={PHONE_COUNTRY_OPTIONS}
      defaultValue="FR"
      aria-label="Phone country"
    />
  ),
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.trigger,
  renderPropTagName: 'button',
});

runComponentConformance({
  name: 'PhoneCountryPicker.Trigger',
  element: <PhoneCountryPicker.Trigger aria-label="Phone country" />,
  refInstanceOf: HTMLButtonElement,
  wrapper: PhoneCountryPickerWrapper,
  ownClassName: styles.trigger,
  renderPropTagName: 'button',
});

runComponentConformance({
  name: 'PhoneCountryPicker.Options',
  element: <PhoneCountryPicker.Options />,
  refInstanceOf: HTMLDivElement,
  wrapper: PhoneCountryPickerOptionsWrapper,
  ownClassName: styles.options,
  renderPropTagName: 'div',
});

describe('PhoneCountryPicker.Trigger', () => {
  it('preserves native button attributes and the accessible name with a decorative flag', () => {
    render(
      <PhoneCountryPicker.Root
        countries={[
          {
            value: 'CA',
            label: 'Canada',
            callingCode: '1',
            flag: <svg role="img" aria-label="Canada flag" />,
          },
        ]}
        value="CA"
      >
        <Dropdown.Root type="picker">
          <PhoneCountryPicker.Trigger
            aria-label="Phone country"
            name="phone-country"
            value="CA"
          />
        </Dropdown.Root>
      </PhoneCountryPicker.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Phone country' });

    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('name', 'phone-country');
    expect(trigger).toHaveAttribute('value', 'CA');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAccessibleDescription('Canada');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('describes the selected country after a supplied description', () => {
    render(
      <PhoneCountryPickerWrapper>
        <span id="phone-country-hint">Used for text messages</span>
        <PhoneCountryPicker.Trigger
          aria-label="Phone country"
          aria-describedby="phone-country-hint"
        />
      </PhoneCountryPickerWrapper>,
    );

    expect(
      screen.getByRole('button', { name: 'Phone country' }),
    ).toHaveAccessibleDescription('France Used for text messages');
  });

  it.each([null, 'unknown'])(
    'has no description for an unresolved selection %s',
    (value) => {
      render(
        <PhoneCountryPicker.Root
          countries={PHONE_COUNTRY_OPTIONS}
          value={value}
        >
          <Dropdown.Root type="picker">
            <PhoneCountryPicker.Trigger aria-label="Phone country" />
          </Dropdown.Root>
        </PhoneCountryPicker.Root>,
      );

      expect(
        screen.getByRole('button', { name: 'Phone country' }),
      ).not.toHaveAccessibleDescription();
    },
  );

  it('keeps caller-owned trigger content alongside the selected description', () => {
    render(
      <PhoneCountryPickerWrapper>
        <PhoneCountryPicker.Trigger aria-label="Phone country">
          Choose country
        </PhoneCountryPicker.Trigger>
      </PhoneCountryPickerWrapper>,
    );

    const trigger = screen.getByRole('button', { name: 'Phone country' });

    expect(trigger).toHaveTextContent('Choose country');
    expect(trigger).toHaveAccessibleDescription('France');
  });
});
