import { Field, InputType } from '@nestjs/graphql';

import { BooleanFieldComparisonInput } from 'src/engine/metadata-modules/pagination/dtos/boolean-field-comparison.input';
import { UUIDFilterComparisonInput } from 'src/engine/metadata-modules/pagination/dtos/uuid-filter-comparison.input';

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

export const FIELD_FILTER_COLUMN_BY_FILTER_FIELD: Record<string, string> = {
  id: 'id',
  isActive: 'isActive',
  isSystem: 'isSystem',
  isUIEditable: 'isUIEditable',
  isUIReadOnly: 'isUIReadOnly',
  objectMetadataId: 'objectMetadataId',
};
