import { Field, InputType } from '@nestjs/graphql';

import { BooleanFieldComparisonInput } from 'src/engine/metadata-modules/pagination/dtos/boolean-field-comparison.input';
import { UUIDFilterComparisonInput } from 'src/engine/metadata-modules/pagination/dtos/uuid-filter-comparison.input';

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

export const OBJECT_FILTER_COLUMN_BY_FILTER_FIELD: Record<string, string> = {
  id: 'id',
  isActive: 'isActive',
  isRemote: 'isRemote',
  isSearchable: 'isSearchable',
  isSystem: 'isSystem',
  isUICreatable: 'isUICreatable',
  isUIEditable: 'isUIEditable',
  isUIReadOnly: 'isUIReadOnly',
};
