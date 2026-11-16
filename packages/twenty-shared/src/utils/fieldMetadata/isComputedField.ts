import { isDefined } from '@/utils/validation/isDefined';

export const isComputedField = <
  TFieldMetadata extends { computation?: unknown },
>(
  fieldMetadata: TFieldMetadata,
): fieldMetadata is TFieldMetadata & {
  computation: NonNullable<TFieldMetadata['computation']>;
} => isDefined(fieldMetadata.computation);
