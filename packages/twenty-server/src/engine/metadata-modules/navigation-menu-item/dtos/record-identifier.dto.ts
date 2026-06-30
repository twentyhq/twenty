import { Field, ObjectType } from '@nestjs/graphql';

import { IsOptional, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('RecordIdentifier')
export class RecordIdentifierDTO {
  @IsUUID()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @Field(() => String)
  labelIdentifier: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  imageIdentifier?: string | null;
}
