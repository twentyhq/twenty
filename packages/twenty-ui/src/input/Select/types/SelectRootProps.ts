import { type Select as SelectPrimitive } from '@base-ui/react/select';

export type SelectRootProps<
  TValue,
  TMultiple extends boolean | undefined = false,
> = SelectPrimitive.Root.Props<TValue, TMultiple>;
