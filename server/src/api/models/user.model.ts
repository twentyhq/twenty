import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { User as UserDB } from '@prisma/client';

@ObjectType()
export class User {
  @Field(() => String)
  id: UserDB[`id`];

  @Field(() => GraphQLISODateTime)
  createdAt: UserDB[`createdAt`];

  @Field(() => GraphQLISODateTime)
  updatedAt: UserDB[`updatedAt`];

  @Field(() => GraphQLISODateTime, { nullable: true })
  deletedAt: UserDB[`deletedAt`];
}
