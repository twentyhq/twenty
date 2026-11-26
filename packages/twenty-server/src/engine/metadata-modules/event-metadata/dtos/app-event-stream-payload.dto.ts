import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type EventOccurrence } from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AppEventOccurrence')
export class AppEventOccurrenceDTO implements EventOccurrence {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  type: string;

  @Field()
  occurredAt: string;

  @Field(() => GraphQLJSON)
  properties: Record<string, unknown>;
}

// A payload without an occurrence tells the client its stream is open
@ObjectType('AppEventStreamPayload')
export class AppEventStreamPayloadDTO {
  @Field(() => AppEventOccurrenceDTO, { nullable: true })
  occurrence: AppEventOccurrenceDTO | null;
}
