import { Field, HideField, InputType } from '@nestjs/graphql';

import { BeforeCreateOne } from '@ptc-org/nestjs-query-graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

import { IsValidName } from 'src/metadata/decorators/is-valid-name.decorator';
import { BeforeCreateOneObject } from 'src/metadata/object-metadata/hooks/before-create-one-object.hook';

@InputType()
@BeforeCreateOne(BeforeCreateOneObject)
export class CreateObjectInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  @IsValidName()
  nameSingular: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  @IsValidName()
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
}
