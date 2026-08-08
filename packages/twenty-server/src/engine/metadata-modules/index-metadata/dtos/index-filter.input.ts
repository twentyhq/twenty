import { Field, InputType } from '@nestjs/graphql';

import { BooleanFieldComparisonInput } from 'src/engine/metadata-modules/pagination/dtos/boolean-field-comparison.input';
import { UUIDFilterComparisonInput } from 'src/engine/metadata-modules/pagination/dtos/uuid-filter-comparison.input';

@InputType('IndexFilter')
export class IndexFilterInput {
  @Field(() => [IndexFilterInput], { nullable: true })
  and?: IndexFilterInput[];

  @Field(() => [IndexFilterInput], { nullable: true })
  or?: IndexFilterInput[];

  @Field(() => UUIDFilterComparisonInput, { nullable: true })
  id?: UUIDFilterComparisonInput;

  @Field(() => BooleanFieldComparisonInput, { nullable: true })
  isCustom?: BooleanFieldComparisonInput;
}

export const INDEX_FILTER_COLUMN_BY_FILTER_FIELD: Record<string, string> = {
  id: 'id',
  isCustom: 'isCustom',
};
