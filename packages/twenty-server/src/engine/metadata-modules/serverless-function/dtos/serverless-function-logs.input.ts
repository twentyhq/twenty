import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('ServerlessFunctionLogsInput')
export class ServerlessFunctionLogsInput {
  @Field(() => UUIDScalarType, { nullable: true })
  applicationId?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  applicationUniversalIdentifier?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  universalIdentifier?: string;
}
