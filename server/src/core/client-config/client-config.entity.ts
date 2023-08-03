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
class SupportChat {
  @Field(() => String)
  supportDriver: string;

  @Field(() => String, { nullable: true })
  supportFrontendKey: string | null;

  @Field(() => String, { nullable: true })
  supportHMACKey: string | null;
}

@ObjectType()
export class ClientConfig {
  @Field(() => AuthProviders, { nullable: false })
  authProviders: AuthProviders;

  @Field(() => Telemetry, { nullable: false })
  telemetry: Telemetry;

  @Field(() => Boolean)
  signInPrefilled: boolean;

  @Field(() => Boolean)
  debugMode: boolean;

  @Field(() => SupportChat)
  supportChat: SupportChat;
}
