import { Field, InputType } from '@nestjs/graphql';

import { BooleanFieldComparisonInput } from 'src/engine/metadata-modules/pagination/dtos/boolean-field-comparison.input';
import { UUIDFilterComparisonInput } from 'src/engine/metadata-modules/pagination/dtos/uuid-filter-comparison.input';
import { type MetadataFilterColumn } from 'src/engine/metadata-modules/pagination/types/metadata-filter-column.type';

@InputType('ObjectFilter')
export class ObjectFilterInput {
  @Field(() => [ObjectFilterInput], { nullable: true })
  and?: ObjectFilterInput[];

  @Field(() => [ObjectFilterInput], { nullable: true })
  or?: ObjectFilterInput[];

  @Field(() => UUIDFilterComparisonInput, { nullable: true })
  id?: UUIDFilterComparisonInput;

  @Field(() => BooleanFieldComparisonInput, { nullable: true })
  isActive?: BooleanFieldComparisonInput;

  @Field(() => BooleanFieldComparisonInput, { nullable: true })
  isRemote?: BooleanFieldComparisonInput;

  @Field(() => BooleanFieldComparisonInput, { nullable: true })
  isSearchable?: BooleanFieldComparisonInput;

  @Field(() => BooleanFieldComparisonInput, { nullable: true })
  isSystem?: BooleanFieldComparisonInput;

  @Field(() => BooleanFieldComparisonInput, { nullable: true })
  isUICreatable?: BooleanFieldComparisonInput;

  @Field(() => BooleanFieldComparisonInput, { nullable: true })
  isUIEditable?: BooleanFieldComparisonInput;

  @Field(() => BooleanFieldComparisonInput, { nullable: true })
  isUIReadOnly?: BooleanFieldComparisonInput;
}

export const OBJECT_FILTER_COLUMN_BY_FILTER_FIELD: Record<
  string,
  MetadataFilterColumn
> = {
  id: { column: 'id', type: 'uuid' },
  isActive: { column: 'isActive', type: 'boolean' },
  isRemote: { column: 'isRemote', type: 'boolean' },
  isSearchable: { column: 'isSearchable', type: 'boolean' },
  isSystem: { column: 'isSystem', type: 'boolean' },
  isUICreatable: { column: 'isUICreatable', type: 'boolean' },
  isUIEditable: { column: 'isUIEditable', type: 'boolean' },
  // The legacy isUIReadOnly column is no longer written since the 2.13
  // rename, so the deprecated filter runs inverted against isUIEditable,
  // consistent with how the field itself is resolved.
  isUIReadOnly: {
    column: 'isUIEditable',
    type: 'boolean',
    invertBooleanValues: true,
  },
};
