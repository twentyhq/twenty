import { Field, ObjectType } from '@nestjs/graphql';

import { IsObject, IsOptional } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

@ObjectType('ServerlessFunctionExecutionResult')
export class ServerlessFunctionExecutionResultDto {
  @IsObject()
  @Field(() => graphqlTypeJson, {
    description: 'Execution result in JSON format',
    nullable: true,
  })
  data?: JSON;

  @Field({ description: 'Execution duration in milliseconds' })
  duration: number;

  @Field({ description: 'Execution status code' })
  status: 200 | 500;

  @IsObject()
  @IsOptional()
  @Field(() => graphqlTypeJson, {
    description: 'Execution error in JSON format',
    nullable: true,
  })
  error?: {
    errorType: string;
    errorMessage: string;
    stackTrace: string;
  };
}
