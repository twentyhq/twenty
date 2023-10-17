import { Field, InputType } from '@nestjs/graphql';

import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

@InputType()
export class CreateFieldInput {
  @IsString()
  @IsNotEmpty()
  @Field({
    deprecationReason: 'Use name instead',
    defaultValue: '[deprecated]',
  })
  nameSingular: string;

  @IsString()
  @IsOptional()
  @Field({
    nullable: true,
    deprecationReason: 'Use name instead',
    defaultValue: '[deprecated]',
  })
  namePlural?: string;

  @IsString()
  @IsNotEmpty()
  @Field({
    deprecationReason: 'Use label instead',
    defaultValue: '[deprecated]',
  })
  labelSingular: string;

  @IsString()
  @IsOptional()
  @Field({
    nullable: true,
    deprecationReason: 'Use name instead',
    defaultValue: '[deprecated]',
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

  // Todo: use a type enum and share with typeorm entity
  @IsEnum([
    'text',
    'phone',
    'email',
    'number',
    'boolean',
    'date',
    'url',
    'money',
  ])
  @IsNotEmpty()
  @Field()
  type: string;

  @IsUUID()
  @Field()
  objectId: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  icon?: string;
}
