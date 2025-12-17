import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('CoreViewGroup')
export class ViewGroupDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field({ nullable: false, defaultValue: true })
  isVisible: boolean;

  @Field({ nullable: false })
  fieldValue: string;

  @Field({ nullable: false, defaultValue: 0 })
  position: number;

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
