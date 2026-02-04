import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

import type { Sources } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateLogicFunctionSourceInput {
  @Field(() => UUIDScalarType, {
    description: 'The id of the logic function.',
  })
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @Field(() => graphqlTypeJson, {
    description:
      'The source code (Sources) to write. Only updates source files.',
  })
  @IsObject()
  code!: Sources;
}
