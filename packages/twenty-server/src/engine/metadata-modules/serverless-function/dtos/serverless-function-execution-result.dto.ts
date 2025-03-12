import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IsObject, IsOptional } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

export enum ServerlessFunctionExecutionStatus {
  IDLE = 'IDLE',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

registerEnumType(ServerlessFunctionExecutionStatus, {
  name: 'ServerlessFunctionExecutionStatus',
  description: 'Status of the serverless function execution',
});

@ObjectType('ServerlessFunctionExecutionResult')
export class ServerlessFunctionExecutionResultDTO {
  @IsObject()
  @Field(() => graphqlTypeJson, {
    description: 'Execution result in JSON format',
    nullable: true,
  })
  data?: JSON;

  @Field({ description: 'Execution Logs' })
  logs: string;

  @Field({ description: 'Execution duration in milliseconds' })
  duration: number;

  @Field(() => ServerlessFunctionExecutionStatus, {
    description: 'Execution status',
  })
  status: ServerlessFunctionExecutionStatus;

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
