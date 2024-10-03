import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsString, IsUUID } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateServerlessFunctionInput {
  @Field(() => UUIDScalarType, {
    description: 'Id of the serverless function to execute',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsString()
  @Field()
  name: string;

  @IsString()
  @Field({ nullable: true })
  description?: string;

  @Field(() => graphqlTypeJson)
  @IsObject()
  code: JSON;
}
