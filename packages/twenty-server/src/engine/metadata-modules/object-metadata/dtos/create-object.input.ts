import { Field, HideField, InputType } from '@nestjs/graphql';

import { BeforeCreateOne } from '@ptc-org/nestjs-query-graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import {
  type FieldMetadataType,
  type FieldMetadataSettings,
} from 'twenty-shared/types';

import { IsValidMetadataName } from 'src/engine/decorators/metadata/is-valid-metadata-name.decorator';
import { BeforeCreateOneObject } from 'src/engine/metadata-modules/object-metadata/hooks/before-create-one-object.hook';

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

  @HideField()
  applicationId?: string;

  @HideField()
  standardId?: string;

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
