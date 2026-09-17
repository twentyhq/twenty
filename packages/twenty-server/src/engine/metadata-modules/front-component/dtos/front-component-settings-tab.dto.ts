import { Field, Int, ObjectType } from '@nestjs/graphql';

import { IsInt, IsOptional, IsString } from 'class-validator';

@ObjectType('FrontComponentSettingsTab')
export class FrontComponentSettingsTabDTO {
  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  label?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  icon?: string;

  @IsInt()
  @IsOptional()
  @Field(() => Int, { nullable: true })
  position?: number;
}
