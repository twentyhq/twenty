import { Field, InputType, Int } from '@nestjs/graphql';

import { IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class RetryAiTaskStepInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  taskId: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  stepId: string;

  @Field(() => Int)
  @IsInt()
  expectedStateVersion: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  clientRequestId: string;
}
