import { type Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { type Switch as SwitchPrimitive } from '@base-ui/react/switch';
import { expectTypeOf, it } from 'vitest';

import {
  type CheckboxIndicatorProps,
  type CheckboxRootProps,
  type SwitchRootProps,
  type SwitchThumbProps,
} from '@ui/primitives/input';

it('preserves upstream part props including render state and refs', () => {
  expectTypeOf<CheckboxIndicatorProps>().toEqualTypeOf<CheckboxPrimitive.Indicator.Props>();
  expectTypeOf<SwitchThumbProps>().toEqualTypeOf<SwitchPrimitive.Thumb.Props>();
  expectTypeOf<Omit<CheckboxRootProps, 'color'>>().toExtend<
    Omit<CheckboxPrimitive.Root.Props, 'color'>
  >();
  expectTypeOf<SwitchRootProps>().toExtend<SwitchPrimitive.Root.Props>();
});

it('preserves upstream change event details', () => {
  expectTypeOf<CheckboxRootProps['onCheckedChange']>().toEqualTypeOf<
    CheckboxPrimitive.Root.Props['onCheckedChange']
  >();
  expectTypeOf<SwitchRootProps['onCheckedChange']>().toEqualTypeOf<
    SwitchPrimitive.Root.Props['onCheckedChange']
  >();
});
