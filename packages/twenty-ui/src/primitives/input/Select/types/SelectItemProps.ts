import { type Select as SelectPrimitive } from '@base-ui/react/select';
import { type ComponentPropsWithRef } from 'react';

export type SelectItemProps = ComponentPropsWithRef<
  typeof SelectPrimitive.Item
>;
