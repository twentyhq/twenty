import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class AuthProviders {
  @Field(() => Boolean)
  google: boolean;

  @Field(() => Boolean)
  magicLink: boolean;

  @Field(() => Boolean)
  password: boolean;
}

@ObjectType()
class Telemetry {
  @Field(() => Boolean)
  enabled: boolean;

  @Field(() => Boolean)
  anonymizationEnabled: boolean;
}

@ObjectType()
export class ClientConfig {
  @Field(() => AuthProviders, { nullable: false })
  authProviders: AuthProviders;

  @Field(() => Telemetry, { nullable: false })
  telemetry: Telemetry;

  @Field(() => Boolean)
  demoMode: boolean;

  @Field(() => Boolean)
  debugMode: boolean;
}
