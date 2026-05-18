import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewSortDirection } from 'twenty-shared/types';

registerEnumType(ViewSortDirection, { name: 'ViewSortDirection' });

@ObjectType('ViewSort')
export class ViewSortDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType, { nullable: false })
  fieldMetadataId: string;

  @Field(() => ViewSortDirection, {
    nullable: false,
    defaultValue: ViewSortDirection.ASC,
  })
  direction: ViewSortDirection;

  @Field(() => String, { nullable: true })
  subFieldName?: string | null;

  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;

  @Field(() => UUIDScalarType, { nullable: false })
  workspaceId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}
