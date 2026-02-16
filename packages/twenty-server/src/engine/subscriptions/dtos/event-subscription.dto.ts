import { Field, ObjectType } from '@nestjs/graphql';

import { MetadataEventDTO } from './metadata-event.dto';
import { ObjectRecordEventDTO } from './object-record-event.dto';

@ObjectType('ObjectRecordEventWithQueryIds')
export class ObjectRecordEventWithQueryIdsDTO {
  @Field(() => [String])
  queryIds: string[];

  @Field(() => ObjectRecordEventDTO)
  objectRecordEvent: ObjectRecordEventDTO;
}

@ObjectType('MetadataEventWithQueryIds')
export class MetadataEventWithQueryIdsDTO {
  @Field(() => [String])
  queryIds: string[];

  @Field(() => MetadataEventDTO)
  metadataEvent: MetadataEventDTO;
}

@ObjectType('EventSubscription')
export class EventSubscriptionDTO {
  @Field(() => String)
  eventStreamId: string;

  @Field(() => [ObjectRecordEventWithQueryIdsDTO])
  objectRecordEventsWithQueryIds: ObjectRecordEventWithQueryIdsDTO[];

  @Field(() => [MetadataEventWithQueryIdsDTO])
  metadataEventsWithQueryIds: MetadataEventWithQueryIdsDTO[];
}
