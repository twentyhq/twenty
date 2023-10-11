import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateObjectInput {
  // Deprecated
  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  displayName: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  displayNameSingular?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  displayNamePlural?: string;

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
