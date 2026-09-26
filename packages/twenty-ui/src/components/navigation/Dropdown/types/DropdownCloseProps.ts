import { type Popover as PopoverPrimitive } from '@base-ui/react/popover';

export type DropdownCloseProps = Omit<
  PopoverPrimitive.Close.Props,
  'aria-label'
> & {
  'aria-label': string;
};
