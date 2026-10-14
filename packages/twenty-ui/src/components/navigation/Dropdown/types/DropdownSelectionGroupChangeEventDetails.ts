import { type BaseUIChangeEventDetails } from '@base-ui/react/internals/createBaseUIEventDetails';

export type DropdownSelectionGroupChangeEventDetails = Pick<
  BaseUIChangeEventDetails<'item-press'>,
  'reason' | 'event' | 'trigger' | 'cancel' | 'isCanceled'
>;
