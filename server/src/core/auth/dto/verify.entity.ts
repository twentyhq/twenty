import { Field, ObjectType } from '@nestjs/graphql';

import { User } from 'src/core/@generated/user/user.model';

import { AuthTokens } from './token.entity';

@ObjectType()
export class Verify extends AuthTokens {
  @Field(() => User)
  user: Partial<User>;
}
