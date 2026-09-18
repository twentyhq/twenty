import { type ReactNode } from 'react';

export type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  filterDropdown?: (filterButton: ReactNode) => ReactNode;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  filterButtonAriaLabel?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
};
