import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class PublishServerlessFunctionInput {
  @Field(() => UUIDScalarType, {
    description: 'Id of the serverless function to publish',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
