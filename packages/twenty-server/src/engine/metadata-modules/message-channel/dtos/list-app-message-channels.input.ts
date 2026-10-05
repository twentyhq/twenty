import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('ListAppMessageChannelsInput')
export class ListAppMessageChannelsInput {
  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  connectedAccountId?: string;
}
