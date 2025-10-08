import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';

@InputType()
export class CreateViewSortInput {
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @Field(() => UUIDScalarType, { nullable: false })
  fieldMetadataId: string;

  @Field(() => ViewSortDirection, {
    nullable: true,
    defaultValue: ViewSortDirection.ASC,
  })
  direction?: ViewSortDirection;

  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;
}
