import { Field, InputType, Int } from '@nestjs/graphql';

import { IsInt, IsNotEmpty, IsObject, IsString, IsUUID } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class AnswerAiTaskInputInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  taskId: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  stepId: string;

  @Field(() => Int, {
    description: 'The pending input version being answered',
  })
  @IsInt()
  inputVersion: number;

  @Field(() => GraphQLJSON, {
    description: 'Answers keyed by field name, validated like a chat form',
  })
  @IsObject()
  values: Record<string, unknown>;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  clientRequestId: string;
}
