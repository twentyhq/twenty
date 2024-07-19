import { Field, ObjectType } from '@nestjs/graphql';

import { IsObject } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

@ObjectType('ServerlessFunctionExecutionResult')
export class ServerlessFunctionExecutionResultDTO {
  @IsObject()
  @Field(() => graphqlTypeJson, {
    description: 'Execution result in JSON format',
  })
  result: JSON;
}
