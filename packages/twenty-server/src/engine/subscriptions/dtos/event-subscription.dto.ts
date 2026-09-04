import { Field, ObjectType } from '@nestjs/graphql';

import { JobStatusDTO } from 'src/engine/core-modules/message-queue/dtos/job-status.dto';

import { MetadataEventDTO } from './metadata-event.dto';
import { ObjectRecordEventDTO } from './object-record-event.dto';

@ObjectType('ObjectRecordEventWithQueryIds')
export class ObjectRecordEventWithQueryIdsDTO {
  @Field(() => [String])
  queryIds: string[];

  @Field(() => ObjectRecordEventDTO)
  objectRecordEvent: ObjectRecordEventDTO;
}

@ObjectType('EventSubscription')
export class EventSubscriptionDTO {
  @Field(() => String)
  eventStreamId: string;

  @Field(() => [ObjectRecordEventWithQueryIdsDTO])
  objectRecordEventsWithQueryIds: ObjectRecordEventWithQueryIdsDTO[];

  @Field(() => [MetadataEventDTO])
  metadataEvents: MetadataEventDTO[];

  @Field(() => [JobStatusDTO])
  queueJobEvents: JobStatusDTO[];
}
