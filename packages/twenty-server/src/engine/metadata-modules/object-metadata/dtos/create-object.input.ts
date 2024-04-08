import { Field, HideField, InputType } from '@nestjs/graphql';

import { BeforeCreateOne } from '@ptc-org/nestjs-query-graphql';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

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

  @HideField()
  dataSourceId: string;

  @HideField()
  workspaceId: string;

  @IsUUID()
  @IsOptional()
  @Field({ nullable: true })
  labelIdentifierFieldMetadataId?: string;

  @IsUUID()
  @IsOptional()
  @Field({ nullable: true })
  imageIdentifierFieldMetadataId?: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isRemote?: boolean;

  @IsOptional()
  @Field({ nullable: true })
  remoteTablePrimaryKeyColumnType?: string;
}
