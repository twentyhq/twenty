import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class ExecuteOneLogicFunctionInput {
  @Field(() => UUIDScalarType, {
    description: 'Id of the logic function to execute',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field(() => graphqlTypeJson, {
    description: 'Payload in JSON format',
  })
  @IsObject()
  payload: JSON;
}
