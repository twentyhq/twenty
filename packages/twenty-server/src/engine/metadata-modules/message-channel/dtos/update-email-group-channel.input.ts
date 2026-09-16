import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('UpdateEmailGroupChannelInput')
export class UpdateEmailGroupChannelInput {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string | null;

  // Null sends this channel's mail back to the routing configured for the kind
  // of work, which is what an unconfigured channel already does.
  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  defaultInboxQueueId?: string | null;
}
