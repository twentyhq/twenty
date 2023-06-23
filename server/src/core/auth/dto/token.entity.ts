import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthToken {
  @Field(() => String)
  token: string;

  @Field(() => Date)
  expiresAt: Date;
}

@ObjectType()
export class AuthTokenPair {
  @Field(() => AuthToken)
  accessToken: AuthToken;

  @Field(() => AuthToken)
  refreshToken: AuthToken;
}

@ObjectType()
export class AuthTokens {
  @Field(() => AuthTokenPair)
  tokens: AuthTokenPair;
}
