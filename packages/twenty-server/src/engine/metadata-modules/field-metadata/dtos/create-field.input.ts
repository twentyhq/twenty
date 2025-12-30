import { Field, HideField, InputType, OmitType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { RelationCreationPayload } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

@InputType()
export class CreateFieldInput extends OmitType(
  FieldMetadataDTO,
  [
    'id',
    'createdAt',
    'updatedAt',
    'standardOverrides',
    'applicationId',
  ] as const,
  InputType,
) {
  @IsUUID()
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @HideField()
  universalIdentifier?: string;

  @HideField()
  standardId?: string;

  @HideField()
  applicationId?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isRemoteCreation?: boolean;

  // TODO @prastoin implement validation for this with validate nested and dedicated class instance
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  relationCreationPayload?: RelationCreationPayload;

  @IsOptional()
  @Field(() => [GraphQLJSON], { nullable: true })
  morphRelationsCreationPayload?: RelationCreationPayload[];
}

@InputType()
export class CreateOneFieldMetadataInput {
  @Type(() => CreateFieldInput)
  @ValidateNested()
  @Field(() => CreateFieldInput, {
    description: 'The record to create',
  })
  field!: CreateFieldInput;
}
