import {
  Field,
  HideField,
  InputType,
  OmitType,
  PartialType,
} from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { RelationUpdatePayload } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { MetadataTranslationOverrideInput } from 'src/engine/metadata-modules/metadata-translation/dtos/metadata-translation-override.input';

@InputType()
export class UpdateFieldInput extends OmitType(
  PartialType(FieldMetadataDTO, InputType),
  [
    'id',
    'type',
    'createdAt',
    'updatedAt',
    'overrides',
    'applicationId',
    'morphId',
  ] as const,
) {
  @HideField()
  id: string;

  @HideField()
  workspaceId: string;

  @IsOptional()
  @Field(() => [GraphQLJSON], { nullable: true })
  morphRelationsUpdatePayload?: RelationUpdatePayload[];

  @Type(() => MetadataTranslationOverrideInput)
  @ValidateNested({ each: true })
  @IsOptional()
  @Field(() => [MetadataTranslationOverrideInput], { nullable: true })
  translations?: MetadataTranslationOverrideInput[];
}

@InputType()
export class UpdateOneFieldMetadataInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the record to update',
  })
  id!: string;

  @Type(() => UpdateFieldInput)
  @ValidateNested()
  @Field(() => UpdateFieldInput, {
    description: 'The record to update',
  })
  update!: UpdateFieldInput;
}
