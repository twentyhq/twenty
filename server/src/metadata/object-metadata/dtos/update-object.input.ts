import { Field, InputType } from '@nestjs/graphql';

import { BeforeUpdateOne } from '@ptc-org/nestjs-query-graphql';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

import { BeforeUpdateOneObject } from 'src/metadata/object-metadata/hooks/before-update-one-object.hook';

@InputType()
@BeforeUpdateOne(BeforeUpdateOneObject)
export class UpdateObjectInput {
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
  nameSingular?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  namePlural?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  icon?: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isActive?: boolean;

  @IsUUID()
  @IsOptional()
  @Field({ nullable: true })
  labelIdentifierFieldMetadataId?: string;

  @IsUUID()
  @IsOptional()
  @Field({ nullable: true })
  imageIdentifierFieldMetadataId?: string;
}
