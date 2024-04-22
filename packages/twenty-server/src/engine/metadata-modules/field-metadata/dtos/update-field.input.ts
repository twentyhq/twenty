import {
  Field,
  HideField,
  InputType,
  OmitType,
  PartialType,
} from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

@InputType()
export class UpdateFieldInput extends OmitType(
  PartialType(FieldMetadataDTO, InputType),
  ['id', 'type', 'createdAt', 'updatedAt'] as const,
) {
  @HideField()
  id: string;

  @HideField()
  workspaceId: string;
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
