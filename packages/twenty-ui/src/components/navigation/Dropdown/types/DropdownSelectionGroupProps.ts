import { type useRender } from '@base-ui/react/use-render';

import { type DropdownSelectionGroupChangeEventDetails } from './DropdownSelectionGroupChangeEventDetails';
import { type DropdownSelectionGroupState } from './DropdownSelectionGroupState';

export type DropdownSelectionGroupProps = Omit<
  useRender.ComponentProps<'div', DropdownSelectionGroupState>,
  'id' | 'defaultValue' | 'onChange'
> & {
  id: string;
  closeOnSelect?: boolean;
} & (
    | {
        multiple?: false;
        value?: string | null;
        defaultValue?: string | null;
        onValueChange?: (
          value: string | null,
          eventDetails: DropdownSelectionGroupChangeEventDetails,
        ) => void;
      }
    | {
        multiple: true;
        value?: string[];
        defaultValue?: string[];
        onValueChange?: (
          value: string[],
          eventDetails: DropdownSelectionGroupChangeEventDetails,
        ) => void;
      }
  );
