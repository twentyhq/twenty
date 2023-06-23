import { Field, ObjectType } from '@nestjs/graphql';
import { AuthToken } from './token.entity';

@ObjectType()
export class LoginToken {
  @Field(() => AuthToken)
  loginToken: AuthToken;
}
