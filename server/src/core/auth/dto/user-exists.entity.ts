import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserExists {
  @Field(() => Boolean)
  exists: boolean;
}
