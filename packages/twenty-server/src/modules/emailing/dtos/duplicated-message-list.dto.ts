import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('DuplicatedMessageList')
export class DuplicatedMessageListDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String, { nullable: true })
  name: string | null;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => Number)
  position: number;

  @Field(() => Number)
  memberCount: number;

  @Field(() => String)
  createdAt: string;

  @Field(() => String)
  updatedAt: string;
}
