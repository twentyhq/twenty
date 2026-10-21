import { useState } from 'react';

import { useDropdownContext } from '@ui/components/navigation/Dropdown/internal/useDropdownContext';

import { type CountrySelectOptionsProps } from '../types/CountrySelectOptionsProps';
import { CountrySelectOptionsContent } from './CountrySelectOptionsContent';

export const CountrySelectOptions = (props: CountrySelectOptionsProps) => {
  const { open } = useDropdownContext();
  const [previousOpen, setPreviousOpen] = useState(open);
  const [openingCount, setOpeningCount] = useState(0);

  if (previousOpen !== open) {
    setPreviousOpen(open);

    if (open) {
      setOpeningCount(openingCount + 1);
    }
  }

  return (
    <CountrySelectOptionsContent
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...props}
      key={openingCount}
    />
  );
};
