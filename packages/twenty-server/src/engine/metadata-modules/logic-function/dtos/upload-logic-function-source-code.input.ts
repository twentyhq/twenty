import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

import type { Sources } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UploadLogicFunctionSourceCodeInput {
  @Field(() => UUIDScalarType, {
    description: 'Id of the logic function to upload source code for',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field(() => graphqlTypeJson, {
    description: 'The source code to upload',
  })
  @IsObject()
  code: Sources;
}
