import { Field, ObjectType } from '@nestjs/graphql';

import { DatabaseEventAction } from 'src/engine/workspace-event-emitter/enums/database-event-action';
import { ObjectRecordEventPropertiesDTO } from 'src/engine/subscriptions/dtos/object-record-event-properties.dto';

@ObjectType('ObjectRecordEvent')
export class ObjectRecordEventDTO {
  @Field(() => DatabaseEventAction)
  action: DatabaseEventAction;

  @Field(() => String)
  objectNameSingular: string;

  @Field(() => String)
  recordId: string;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => String, { nullable: true })
  workspaceMemberId?: string;

  @Field(() => ObjectRecordEventPropertiesDTO)
  properties: ObjectRecordEventPropertiesDTO;
}
