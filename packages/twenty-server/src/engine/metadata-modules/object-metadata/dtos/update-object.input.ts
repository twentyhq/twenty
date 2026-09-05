import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  MetadataReadability,
  ObjectOpenRecordIn,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { IsValidMetadataName } from 'src/engine/decorators/metadata/is-valid-metadata-name.decorator';
import { MetadataTranslationOverrideInput } from 'src/engine/metadata-modules/metadata-translation/dtos/metadata-translation-override.input';
import { SHARING_RULE_ACCESS_LEVELS } from 'src/engine/metadata-modules/sharing-rule/constants/sharing-rule-access-levels.constant';

export const BACKFILL_SHARING_RULE_GRANTEE_PRINCIPAL_TYPES = [
  RecordSharePrincipalType.EVERYONE,
  RecordSharePrincipalType.ROLE,
] as const;

@InputType()
export class BackfillSharingRuleInput {
  @IsIn(BACKFILL_SHARING_RULE_GRANTEE_PRINCIPAL_TYPES)
  @IsNotEmpty()
  @Field(() => RecordSharePrincipalType)
  granteePrincipalType: (typeof BACKFILL_SHARING_RULE_GRANTEE_PRINCIPAL_TYPES)[number];

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  granteeRoleId?: string | null;

  @IsIn(SHARING_RULE_ACCESS_LEVELS)
  @IsNotEmpty()
  @Field(() => RecordShareAccessLevel)
  accessLevel: RecordShareAccessLevel;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  name?: string | null;
}

@InputType()
export class UpdateObjectPayload {
  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  labelSingular?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  labelPlural?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  @IsValidMetadataName()
  nameSingular?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  @IsValidMetadataName()
  namePlural?: string;

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

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  color?: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isActive?: boolean;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  labelIdentifierFieldMetadataId?: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  imageIdentifierFieldMetadataId?: string | null;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  ownerFieldMetadataId?: string | null;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isLabelSyncedWithName?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isSearchable?: boolean;

  @IsEnum(ObjectOpenRecordIn)
  @IsOptional()
  @Field(() => ObjectOpenRecordIn, { nullable: true })
  openRecordIn?: ObjectOpenRecordIn;

  @IsEnum(MetadataReadability)
  @IsOptional()
  @Field(() => MetadataReadability, { nullable: true })
  readability?: MetadataReadability;

  @Type(() => BackfillSharingRuleInput)
  @ValidateNested()
  @IsOptional()
  @Field(() => BackfillSharingRuleInput, { nullable: true })
  backfillSharingRule?: BackfillSharingRuleInput | null;

  @Type(() => MetadataTranslationOverrideInput)
  @ValidateNested({ each: true })
  @IsOptional()
  @Field(() => [MetadataTranslationOverrideInput], { nullable: true })
  translations?: MetadataTranslationOverrideInput[];
}

@InputType()
export class UpdateOneObjectInput {
  @Type(() => UpdateObjectPayload)
  @ValidateNested()
  @Field(() => UpdateObjectPayload)
  update: UpdateObjectPayload;

  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the object to update',
  })
  @IsUUID()
  id!: string;
}
