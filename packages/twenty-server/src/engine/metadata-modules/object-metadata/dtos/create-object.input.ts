import { Field, HideField, InputType } from '@nestjs/graphql';

import { BeforeCreateOne } from '@ptc-org/nestjs-query-graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { FieldMetadataType } from 'twenty-shared/types';
import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { IsValidMetadataName } from 'src/engine/decorators/metadata/is-valid-metadata-name.decorator';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { BeforeCreateOneObject } from 'src/engine/metadata-modules/object-metadata/hooks/before-create-one-object.hook';
import { buildDefaultFlatFieldMetadataForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-fields-for-custom-object.util';

@InputType()
@BeforeCreateOne(BeforeCreateOneObject)
export class CreateObjectInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  @IsValidMetadataName()
  nameSingular: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  @IsValidMetadataName()
  namePlural: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  labelSingular: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  labelPlural: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  icon?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  shortcut?: string;

  @HideField()
  dataSourceId: string;

  @HideField()
  workspaceId: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isRemote?: boolean;

  @IsOptional()
  @Field({ nullable: true })
  primaryKeyColumnType?: string;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  primaryKeyFieldMetadataSettings?: FieldMetadataSettings<FieldMetadataType>;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true }) // Not nullable to me
  isLabelSyncedWithName?: boolean;
}

export const fromCreateObjectInputToFlatObjectMetadata = (
  rawCreateObjectInput: CreateObjectInput,
): FlatObjectMetadata => {
  if (rawCreateObjectInput.isRemote) {
    throw new UserInputError('Remote objects are not supported yet');
  }

  const createObjectInput =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateObjectInput,
      [
        'description',
        'icon',
        'labelPlural',
        'labelSingular',
        'namePlural',
        'nameSingular',
        'shortcut',
      ],
    );

  const objectMetadataId = v4();
  const createdAt = new Date();
  const baseCustomFlatFieldMetadatas =
    buildDefaultFlatFieldMetadataForCustomObject({
      createdAt,
      objectMetadataId,
      workspaceId: createObjectInput.workspaceId,
    });

  return {
    createdAt,
    updatedAt: createdAt,
    dataSourceId: createObjectInput.dataSourceId, // TODO is it enough ?
    description: createObjectInput.description ?? null,
    duplicateCriteria: [], // TODO is it enough ?
    flatFieldMetadatas: Object.values(baseCustomFlatFieldMetadatas),
    flatIndexMetadatas: [], // TODO is it enough ?
    icon: createObjectInput.icon ?? null,
    id: objectMetadataId,
    imageIdentifierFieldMetadataId: null,
    isActive: true,
    isAuditLogged: true,
    isCustom: true,
    isLabelSyncedWithName: createObjectInput.isLabelSyncedWithName ?? false,
    isRemote: false,
    isSearchable: true,
    isSystem: false,
    labelIdentifierFieldMetadataId: baseCustomFlatFieldMetadatas.nameField.id,
    labelPlural: createObjectInput.labelPlural ?? null,
    labelSingular: createObjectInput.labelSingular ?? null,
    namePlural: createObjectInput.namePlural ?? null,
    nameSingular: createObjectInput.nameSingular ?? null,
    shortcut: createObjectInput.shortcut ?? null,
    standardId: null,
    standardOverrides: null,
    uniqueIdentifier: objectMetadataId,
    targetTableName: 'DEPRECATED',
    workspaceId: createObjectInput.workspaceId,
  };
};
