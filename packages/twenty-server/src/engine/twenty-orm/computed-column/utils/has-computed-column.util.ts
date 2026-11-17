import { type FieldMetadataComputation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ComputedColumnComputation } from 'src/engine/twenty-orm/computed-column/types/computed-column-computation.type';

export const hasComputedColumn = <
  TFieldMetadata extends { computation?: FieldMetadataComputation | null },
>(
  fieldMetadata: TFieldMetadata,
): fieldMetadata is TFieldMetadata & {
  computation: ComputedColumnComputation;
} =>
  isDefined(fieldMetadata.computation) &&
  fieldMetadata.computation.kind !== 'FILTERED_RELATION';
