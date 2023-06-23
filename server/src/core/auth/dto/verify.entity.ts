import { Field, ObjectType } from '@nestjs/graphql';
import { AuthTokens } from './token.entity';
import { User } from 'src/core/@generated/user/user.model';

@ObjectType()
export class Verify extends AuthTokens {
  @Field(() => User)
  user: User;
}
