import { Field, ObjectType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

@ObjectType('ObjectStandardOverrides')
export class ObjectStandardOverridesDTO {
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  labelSingular?: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  labelPlural?: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  icon?: string | null;
}
