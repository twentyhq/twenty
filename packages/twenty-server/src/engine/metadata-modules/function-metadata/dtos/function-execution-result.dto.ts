import { Field, ObjectType } from '@nestjs/graphql';

import { IsObject } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

@ObjectType('FunctionExecutionResult')
export class FunctionExecutionResultDTO {
  @IsObject()
  @Field(() => graphqlTypeJson, {
    description: 'Execution result in JSON format',
  })
  result: JSON;
}
