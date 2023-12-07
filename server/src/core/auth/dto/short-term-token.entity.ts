import { Field, ObjectType } from '@nestjs/graphql';

import { AuthToken } from './token.entity';

@ObjectType()
export class ShortTermToken {
  @Field(() => AuthToken)
  shortTermToken: AuthToken;
}
