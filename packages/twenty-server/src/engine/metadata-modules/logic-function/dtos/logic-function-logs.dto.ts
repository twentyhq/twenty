import { Field, HideField, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('LogicFunctionLogs')
export class LogicFunctionLogsDTO {
  @Field({ description: 'Execution Logs' })
  logs: string;

  @HideField()
  applicationUniversalIdentifier?: string;

  @HideField()
  applicationId?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @HideField()
  id?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  universalIdentifier?: string;
}
