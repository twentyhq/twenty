import { Field, ObjectType } from '@nestjs/graphql';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType()
export class ConnectedWhatsappAccountDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  businessAccountId: string;

  @Field(() => String)
  provider: ConnectedAccountProvider;

  @Field(() => UUIDScalarType)
  accountOwnerId: string;

  @Field(() => String, { nullable: true })
  appSecret: string | null;

  @Field(() => String, { nullable: true })
  bearerToken: string | null;

  @Field(() => String, { nullable: true })
  webhookToken: string | null;
}
