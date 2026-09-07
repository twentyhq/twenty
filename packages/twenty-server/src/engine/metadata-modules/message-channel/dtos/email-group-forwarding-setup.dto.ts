import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('EmailGroupForwardingSetup')
export class EmailGroupForwardingSetupDTO {
  @Field(() => UUIDScalarType)
  messageChannelId: string;

  @Field(() => String)
  status: string;
}
