import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateSkillInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  label: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  icon?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  content: string;
}
