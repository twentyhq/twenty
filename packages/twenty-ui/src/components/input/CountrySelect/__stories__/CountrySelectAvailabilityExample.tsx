import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { CountrySelect } from '../CountrySelect';
import { type CountrySelectProps } from '../types/CountrySelectProps';
import { COUNTRY_CHOICES } from './COUNTRY_CHOICES';

type CountrySelectAvailabilityExampleProps = Partial<CountrySelectProps> & {
  controlled?: boolean;
  availability: 'disabled' | 'countries';
  ignoreCloseRequests?: boolean;
};

export const CountrySelectAvailabilityExample = ({
  controlled = false,
  availability,
  ignoreCloseRequests = false,
  onOpenChange,
}: CountrySelectAvailabilityExampleProps) => {
  const [unavailable, setUnavailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [revision, setRevision] = useState(0);

  return (
    <>
      <CountrySelect
        countries={
          unavailable && availability === 'countries' ? [] : COUNTRY_CHOICES
        }
        disabled={unavailable && availability === 'disabled'}
        label="Country"
        searchLabel="Search countries"
        noCountryLabel="No country"
        noResultsLabel="No countries found"
        value="France"
        onValueChange={() => undefined}
        open={controlled ? open : undefined}
        onOpenChange={(nextOpen) => {
          onOpenChange?.(nextOpen);

          if (!ignoreCloseRequests || nextOpen) {
            setOpen(nextOpen);
          }
        }}
        popupProps={{
          render: (popupProps) => (
            <div {...popupProps}>
              {popupProps.children}
              <Button onClick={() => setUnavailable(true)}>
                Make countries unavailable
              </Button>
            </div>
          ),
        }}
      />
      {unavailable && (
        <>
          <Button onClick={() => setUnavailable(false)}>
            Restore countries
          </Button>
          <Button onClick={() => setRevision(revision + 1)}>
            Refresh host {revision}
          </Button>
        </>
      )}
    </>
  );
};
