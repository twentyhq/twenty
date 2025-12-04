import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('ServerlessFunctionLogs')
export class ServerlessFunctionLogsInput {
  @Field(() => UUIDScalarType, { nullable: true })
  applicationId?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  universalIdentifier?: string;
}
