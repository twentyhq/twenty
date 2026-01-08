import { Field, ObjectType } from '@nestjs/graphql';

import { OnDbEventDTO } from './on-db-event.dto';

@ObjectType('DbEventWithRelatedQueryIds')
export class DbEventWithRelatedQueryIdsDTO {
  @Field(() => [String])
  queryIds: string[];

  @Field(() => OnDbEventDTO)
  event: OnDbEventDTO;
}

@ObjectType('DbEventsRelatedToQueries')
export class DbEventsRelatedToQueriesDTO {
  @Field(() => String)
  eventStreamId: string;

  @Field(() => [DbEventWithRelatedQueryIdsDTO])
  dbEventsWithRelatedQueryIds: DbEventWithRelatedQueryIdsDTO[];
}
