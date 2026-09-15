import { type BooleanFieldComparisonInput } from 'src/engine/metadata-modules/pagination/dtos/boolean-field-comparison.input';
import { type UUIDFilterComparisonInput } from 'src/engine/metadata-modules/pagination/dtos/uuid-filter-comparison.input';

export type MetadataFilterComparison = UUIDFilterComparisonInput &
  BooleanFieldComparisonInput;
