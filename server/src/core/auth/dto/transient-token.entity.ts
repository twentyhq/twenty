import { Field, ObjectType } from '@nestjs/graphql';

import { AuthToken } from './token.entity';

@ObjectType()
export class TransientToken {
  @Field(() => AuthToken)
  transientToken: AuthToken;
}
