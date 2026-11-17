import { type Expect } from '@/testing/types/TestingGenerics';

declare const brandedTypeTag: unique symbol;

export type BrandedType<TValue, TBrand extends string> = TValue & {
  readonly [brandedTypeTag]?: { readonly [TBrandName in TBrand]: true };
};

// Not distributive: callers narrow with NonNullable or Extract before asking
export type HasBrandedType<TValue, TBrand extends string> = [TValue] extends [
  { readonly [brandedTypeTag]?: infer TBrands },
]
  ? TBrand extends keyof NonNullable<TBrands>
    ? true
    : false
  : false;

// oxlint-disable-next-line unused-imports/no-unused-vars
type BrandedTypeTests = [
  Expect<HasBrandedType<BrandedType<string, 'legacy'>, 'legacy'>>,
  Expect<
    HasBrandedType<BrandedType<string, 'legacy'>, 'other'> extends false
      ? true
      : false
  >,
  Expect<HasBrandedType<string, 'legacy'> extends false ? true : false>,
  Expect<HasBrandedType<{ id: string }, 'legacy'> extends false ? true : false>,

  Expect<HasBrandedType<BrandedType<BrandedType<string, 'a'>, 'b'>, 'a'>>,
  Expect<HasBrandedType<BrandedType<BrandedType<string, 'a'>, 'b'>, 'b'>>,

  Expect<BrandedType<string, 'legacy'> extends string ? true : false>,
  Expect<
    HasBrandedType<NonNullable<BrandedType<string, 'legacy'> | null>, 'legacy'>
  >,
];
