import { Field, HideField, ObjectType } from '@nestjs/graphql';

@ObjectType('ServerlessFunctionLogs')
export class ServerlessFunctionLogsDTO {
  @Field({ description: 'Execution Logs' })
  logs: string;

  @HideField()
  applicationUniversalIdentifier?: string;

  @HideField()
  applicationId?: string;

  @HideField()
  name?: string;

  @HideField()
  id?: string;

  @HideField()
  universalIdentifier?: string;
}
