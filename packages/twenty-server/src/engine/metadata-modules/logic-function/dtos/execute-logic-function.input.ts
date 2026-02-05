import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsUUID,
} from 'class-validator';
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

  @Field(() => Boolean, {
    description: 'Force rebuild from source before executing',
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  forceRebuild?: boolean;
}
