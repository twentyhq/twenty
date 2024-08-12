import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

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
  @IsNotEmpty()
  @Field()
  name: string;

  @IsString()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  code: string;
}
