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
export class TestMcpServerToolInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  mcpServerId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  toolName: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  toolArguments?: Record<string, unknown>;
}
