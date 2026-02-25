import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('MessageHtmlPreview')
export class MessageHtmlPreviewDTO {
  @Field(() => UUIDScalarType)
  messageId: string;

  @Field(() => String, { nullable: true })
  html: string | null;
}

@ObjectType('MessageHtmlPreviewBatch')
export class MessageHtmlPreviewBatchDTO {
  @Field(() => [MessageHtmlPreviewDTO])
  previews: MessageHtmlPreviewDTO[];
}
