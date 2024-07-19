import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

@ArgsType()
export class ExecuteServerlessFunctionInput {
  @Field({ description: 'Name of the serverless function to execute' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => graphqlTypeJson, {
    description: 'Payload in JSON format',
    nullable: true,
  })
  @IsObject()
  @IsOptional()
  payload?: JSON;
}
