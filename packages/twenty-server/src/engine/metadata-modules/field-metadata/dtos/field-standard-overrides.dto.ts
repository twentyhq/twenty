import { Field, ObjectType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

@ObjectType('StandardOverrides')
export class FieldStandardOverridesDTO {
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  label?: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  icon?: string | null;
}
