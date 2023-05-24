import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { User as UserDB } from '@prisma/client';
import { FilterableField } from '@ptc-org/nestjs-query-graphql';

@ObjectType()
export class User {
  @Field(() => String)
  id: UserDB[`id`];

  @FilterableField(() => GraphQLISODateTime)
  createdAt: UserDB[`createdAt`];

  @Field(() => GraphQLISODateTime)
  updatedAt: UserDB[`updatedAt`];

  @Field(() => GraphQLISODateTime, { nullable: true })
  deletedAt: UserDB[`deletedAt`];
}