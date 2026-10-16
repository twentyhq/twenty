import { type useRender } from '@base-ui/react/use-render';

import { type DropdownSelectionGroupChangeEventDetails } from './DropdownSelectionGroupChangeEventDetails';
import { type DropdownSelectionGroupState } from './DropdownSelectionGroupState';

type DropdownSelectionGroupValueProps<TValue> = {
  defaultValue?: TValue;
  onValueChange?: (
    value: TValue,
    eventDetails: DropdownSelectionGroupChangeEventDetails,
  ) => void;
} & ({ id?: string; value: TValue } | { id: string; value?: TValue });

export type DropdownSelectionGroupProps = Omit<
  useRender.ComponentProps<'div', DropdownSelectionGroupState>,
  'id' | 'defaultValue' | 'onChange'
> & {
  closeOnSelect?: boolean;
} & (
    | ({ multiple?: false } & DropdownSelectionGroupValueProps<string | null>)
    | ({ multiple: true } & DropdownSelectionGroupValueProps<string[]>)
  );
