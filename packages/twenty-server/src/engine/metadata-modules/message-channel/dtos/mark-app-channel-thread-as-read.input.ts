import { Field, InputType } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('MarkAppChannelThreadAsReadInput')
export class MarkAppChannelThreadAsReadInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  messageChannelId: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  messageThreadId: string;
}
