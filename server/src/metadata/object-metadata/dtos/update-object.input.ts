import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateObjectInput {
  @IsString()
  @IsOptional()
  @Field()
  nameSingular: string;

  @IsString()
  @IsOptional()
  @Field()
  namePlural: string;

  @IsString()
  @IsOptional()
  @Field()
  labelSingular: string;

  @IsString()
  @IsOptional()
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

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isActive?: boolean;
}
