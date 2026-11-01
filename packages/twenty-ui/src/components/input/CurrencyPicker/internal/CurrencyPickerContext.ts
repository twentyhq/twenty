import { createContext, type ReactNode } from 'react';

import { type CurrencyPickerRootProps } from '../types/CurrencyPickerRootProps';
import { type CurrencyPickerState } from '../types/CurrencyPickerState';
import { type PreparedCurrencyPickerOption } from './PreparedCurrencyPickerOption';

export const CurrencyPickerContext = createContext<
  | {
      state: CurrencyPickerState;
      groupId: string;
      options: PreparedCurrencyPickerOption[];
      selectionProps: Pick<
        CurrencyPickerRootProps,
        'value' | 'defaultValue' | 'onValueChange' | 'closeOnSelect'
      >;
      renderValue?: (state: CurrencyPickerState) => ReactNode;
    }
  | undefined
>(undefined);
