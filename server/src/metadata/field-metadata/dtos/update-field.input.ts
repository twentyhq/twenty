import { Field, InputType } from '@nestjs/graphql';

import { BeforeUpdateOne } from '@ptc-org/nestjs-query-graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

import { BeforeUpdateOneField } from 'src/metadata/field-metadata/hooks/before-update-one-field.hook';

@InputType()
@BeforeUpdateOne(BeforeUpdateOneField)
export class UpdateFieldInput {
  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  label?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  name?: string;

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
}
