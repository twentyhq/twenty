import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsOptional, IsUUID } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class ExecuteServerlessFunctionInput {
  @Field(() => UUIDScalarType, {
    description: 'Id of the serverless function to execute',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field(() => graphqlTypeJson, {
    description: 'Payload in JSON format',
    nullable: true,
  })
  @IsObject()
  @IsOptional()
  payload?: JSON;
}
