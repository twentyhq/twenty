import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { ViewTabType } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

registerEnumType(ViewTabType, { name: 'ViewTabType' });

@ObjectType('ViewTab')
export class ViewTabDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => ViewTabType, { nullable: false })
  type: ViewTabType;

  @Field(() => String, { nullable: true })
  fieldValue: string | null;

  @Field(() => String, { nullable: true })
  name: string | null;

  @Field({ nullable: false, defaultValue: 0 })
  position: number;

  @Field({ nullable: false, defaultValue: true })
  isVisible: boolean;

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
