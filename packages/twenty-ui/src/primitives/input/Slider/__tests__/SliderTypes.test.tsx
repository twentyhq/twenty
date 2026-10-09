import { type Slider as SliderPrimitive } from '@base-ui/react/slider';
import { expectTypeOf, it } from 'vitest';

import { Slider, type SliderRootProps } from '@ui/primitives/input';

it('accepts the upstream default single or range props', () => {
  expectTypeOf<
    Omit<SliderRootProps, 'color'>
  >().toEqualTypeOf<SliderPrimitive.Root.Props>();
  expectTypeOf<SliderRootProps<number>['onValueChange']>().toEqualTypeOf<
    SliderPrimitive.Root.Props<number>['onValueChange']
  >();
  expectTypeOf<
    SliderRootProps<readonly [number, number]>['onValueCommitted']
  >().toEqualTypeOf<
    SliderPrimitive.Root.Props<readonly [number, number]>['onValueCommitted']
  >();
});

it('infers number values and distinct change and commit details', () => {
  <Slider.Root
    defaultValue={40}
    onValueChange={(value, details) => {
      expectTypeOf(value).toEqualTypeOf<number>();
      expectTypeOf(
        details,
      ).toEqualTypeOf<SliderPrimitive.Root.ChangeEventDetails>();
    }}
    onValueCommitted={(value, details) => {
      expectTypeOf(value).toEqualTypeOf<number>();
      expectTypeOf(
        details,
      ).toEqualTypeOf<SliderPrimitive.Root.CommitEventDetails>();
    }}
  />;
});

it('retains readonly tuple inference in change and commit callbacks', () => {
  const range: readonly [number, number] = [25, 75];

  <Slider.Root
    value={range}
    onValueChange={(value, details) => {
      expectTypeOf(value).toEqualTypeOf<typeof range>();
      expectTypeOf(
        details,
      ).toEqualTypeOf<SliderPrimitive.Root.ChangeEventDetails>();
    }}
    onValueCommitted={(value, details) => {
      expectTypeOf(value).toEqualTypeOf<typeof range>();
      expectTypeOf(
        details,
      ).toEqualTypeOf<SliderPrimitive.Root.CommitEventDetails>();
    }}
  />;
});
