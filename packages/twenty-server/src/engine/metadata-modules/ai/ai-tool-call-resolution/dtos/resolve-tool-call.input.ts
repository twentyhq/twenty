import { Field, InputType } from '@nestjs/graphql';

import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class ResolveToolCallInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  threadId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  toolCallId: string;

  @Field(() => GraphQLJSON, {
    description: 'Output of the tool call, validated against what it asked',
  })
  @IsObject()
  output: Record<string, unknown>;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  modelId?: string;
}
