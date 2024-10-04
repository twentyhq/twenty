import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class ExecuteServerlessFunctionInput {
  @Field(() => UUIDScalarType, {
    description: 'Id of the serverless function to execute',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field(() => graphqlTypeJson, {
    description: 'Payload in JSON format',
  })
  @IsObject()
  payload: JSON;

  @Field(() => String, {
    nullable: false,
    description: 'Version of the serverless function to execute',
    defaultValue: 'latest',
  })
  version: string;
}
