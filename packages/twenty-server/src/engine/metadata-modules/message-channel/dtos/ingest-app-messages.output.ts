import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('IngestedAppMessage')
export class IngestedAppMessageDTO {
  @Field()
  externalId: string;

  // Stable across re-ingestion of the same externalId, so it is safe to hang
  // timeline activities or app records off it.
  @Field(() => UUIDScalarType)
  messageId: string;

  @Field(() => UUIDScalarType)
  messageThreadId: string;
}

@ObjectType('IngestAppMessagesOutput')
export class IngestAppMessagesOutput {
  @Field(() => [IngestedAppMessageDTO])
  messages: IngestedAppMessageDTO[];
}
