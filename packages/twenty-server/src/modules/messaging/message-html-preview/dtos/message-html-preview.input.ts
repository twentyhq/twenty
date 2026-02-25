import { ArgsType, Field } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class GetMessageHtmlPreviewArgs {
  @Field(() => UUIDScalarType)
  messageId: string;
}

@ArgsType()
export class GetMessageHtmlPreviewBatchArgs {
  @Field(() => [UUIDScalarType])
  messageThreadIds: string[];
}
