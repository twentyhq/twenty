import { Field, ObjectType } from '@nestjs/graphql';

import { ObjectRecordEventDTO } from './object-record-event.dto';

@ObjectType('EventWithQueryIds')
export class EventWithQueryIdsDTO {
  @Field(() => [String])
  queryIds: string[];

  @Field(() => ObjectRecordEventDTO)
  event: ObjectRecordEventDTO;
}

@ObjectType('EventSubscription')
export class EventSubscriptionDTO {
  @Field(() => String)
  eventStreamId: string;

  @Field(() => [EventWithQueryIdsDTO])
  eventWithQueryIdsList: EventWithQueryIdsDTO[];
}
