import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateFieldInput {
  @IsString()
  @IsOptional()
  @Field({
    nullable: true,
    deprecationReason: 'Use name instead',
  })
  nameSingular?: string;

  @IsString()
  @IsOptional()
  @Field({
    nullable: true,
    deprecationReason: 'Use name instead',
  })
  namePlural?: string;

  @IsString()
  @IsOptional()
  @Field({
    nullable: true,
    deprecationReason: 'Use label instead',
  })
  labelSingular?: string;

  @IsString()
  @IsOptional()
  @Field({
    nullable: true,
    deprecationReason: 'Use name instead',
  })
  labelPlural?: string;

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
