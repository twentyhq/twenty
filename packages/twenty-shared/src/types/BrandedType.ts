import { type Expect } from '@/testing/types/TestingGenerics';

declare const brandedTypeTag: unique symbol;

// One brand per type: the tag holds the name itself, so a second brand intersects to never
export type BrandedType<TValue, TBrand extends string> = TValue & {
  readonly [brandedTypeTag]?: TBrand;
};

// Not distributive: callers narrow with NonNullable or Extract before asking
export type HasBrandedType<TValue, TBrand extends string> = [TValue] extends [
  { readonly [brandedTypeTag]?: infer TValueBrand },
]
  ? TBrand extends NonNullable<TValueBrand>
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

  Expect<
    HasBrandedType<
      BrandedType<BrandedType<string, 'a'>, 'b'>,
      'a'
    > extends false
      ? true
      : false
  >,

  Expect<BrandedType<string, 'legacy'> extends string ? true : false>,
  Expect<string extends BrandedType<string, 'legacy'> ? true : false>,
  Expect<
    HasBrandedType<NonNullable<BrandedType<string, 'legacy'> | null>, 'legacy'>
  >,
];
