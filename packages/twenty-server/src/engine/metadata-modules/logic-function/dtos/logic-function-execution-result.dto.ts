import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IsObject, IsOptional } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

export enum LogicFunctionExecutionStatus {
  IDLE = 'IDLE',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

registerEnumType(LogicFunctionExecutionStatus, {
  name: 'LogicFunctionExecutionStatus',
  description: 'Status of the logic function execution',
});

@ObjectType('LogicFunctionExecutionResult')
export class LogicFunctionExecutionResultDTO {
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

  @Field(() => LogicFunctionExecutionStatus, {
    description: 'Execution status',
  })
  status: LogicFunctionExecutionStatus;

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
