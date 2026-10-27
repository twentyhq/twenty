import { Field, InputType } from '@nestjs/graphql';

import { UUIDFilterComparisonInput } from 'src/engine/metadata-modules/pagination/dtos/uuid-filter-comparison.input';
import { type MetadataFilterColumn } from 'src/engine/metadata-modules/pagination/types/metadata-filter-column.type';

@InputType('IndexFilter')
export class IndexFilterInput {
  @Field(() => [IndexFilterInput], { nullable: true })
  and?: IndexFilterInput[];

  @Field(() => [IndexFilterInput], { nullable: true })
  or?: IndexFilterInput[];

  @Field(() => UUIDFilterComparisonInput, { nullable: true })
  id?: UUIDFilterComparisonInput;
}

export const INDEX_FILTER_COLUMN_BY_FILTER_FIELD: Record<
  string,
  MetadataFilterColumn
> = {
  id: { column: 'id', type: 'uuid' },
};
