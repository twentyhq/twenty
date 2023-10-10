import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateObjectInput {
  // Deprecated
  @IsString()
  @IsNotEmpty()
  @Field()
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
}
