import { type useRender } from '@base-ui/react/use-render';

import { type CurrencyPickerOption } from './CurrencyPickerOption';

export type CurrencyPickerOptionsProps = Omit<
  useRender.ComponentProps<'div'>,
  'children'
> & {
  currencies: readonly CurrencyPickerOption[];
  value?: string;
  onValueChange: (code: string) => void;
  disabled?: boolean;
  searchLabel?: string;
  emptyLabel?: string;
};
