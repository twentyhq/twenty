import { expectTypeOf, it } from 'vitest';

import {
  type InputProps,
  type InputVariant,
  type TextareaProps,
} from '@ui/primitives/input';

it('keeps shared variants compatible with both controls and inline specific to Input', () => {
  expectTypeOf<InputVariant>().toExtend<NonNullable<InputProps['variant']>>();
  expectTypeOf<
    NonNullable<TextareaProps['variant']>
  >().toEqualTypeOf<InputVariant>();
  expectTypeOf<InputProps['variant']>()
    .extract<'inline'>()
    .toEqualTypeOf<'inline'>();
  expectTypeOf<InputVariant>().extract<'inline'>().toBeNever();
});
