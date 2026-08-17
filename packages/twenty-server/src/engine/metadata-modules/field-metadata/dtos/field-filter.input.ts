import { Field, InputType } from '@nestjs/graphql';

import { BooleanFieldComparisonInput } from 'src/engine/metadata-modules/pagination/dtos/boolean-field-comparison.input';
import { UUIDFilterComparisonInput } from 'src/engine/metadata-modules/pagination/dtos/uuid-filter-comparison.input';
import { type MetadataFilterColumn } from 'src/engine/metadata-modules/pagination/types/metadata-filter-column.type';

@InputType('FieldFilter')
export class FieldFilterInput {
  @Field(() => [FieldFilterInput], { nullable: true })
  and?: FieldFilterInput[];

  @Field(() => [FieldFilterInput], { nullable: true })
  or?: FieldFilterInput[];

  @Field(() => UUIDFilterComparisonInput, { nullable: true })
  id?: UUIDFilterComparisonInput;

  @Field(() => BooleanFieldComparisonInput, { nullable: true })
  isActive?: BooleanFieldComparisonInput;

  @Field(() => BooleanFieldComparisonInput, { nullable: true })
  isSystem?: BooleanFieldComparisonInput;

  @Field(() => BooleanFieldComparisonInput, { nullable: true })
  isUIEditable?: BooleanFieldComparisonInput;

  @Field(() => BooleanFieldComparisonInput, { nullable: true })
  isUIReadOnly?: BooleanFieldComparisonInput;

  @Field(() => UUIDFilterComparisonInput, { nullable: true })
  objectMetadataId?: UUIDFilterComparisonInput;
}

export const FIELD_FILTER_COLUMN_BY_FILTER_FIELD: Record<
  string,
  MetadataFilterColumn
> = {
  id: { column: 'id', type: 'uuid' },
  isActive: { column: 'isActive', type: 'boolean' },
  isSystem: { column: 'isSystem', type: 'boolean' },
  isUIEditable: { column: 'isUIEditable', type: 'boolean' },
  // The legacy isUIReadOnly column is no longer written since the 2.13
  // rename, so the deprecated filter runs inverted against isUIEditable,
  // consistent with how the field itself is resolved.
  isUIReadOnly: {
    column: 'isUIEditable',
    type: 'boolean',
    invertBooleanValues: true,
  },
  objectMetadataId: { column: 'objectMetadataId', type: 'uuid' },
};
