import { Field, InputType } from '@nestjs/graphql';

import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class AnswerAskInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  askId: string;

  @Field(() => GraphQLJSON, {
    description:
      'The answer, validated against what the Ask asked (its form kind)',
  })
  @IsObject()
  response: Record<string, unknown>;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  modelId?: string;
}
