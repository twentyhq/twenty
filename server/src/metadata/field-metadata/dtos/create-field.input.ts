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
  @Field()
  displayName: string;

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

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  placeholder?: string;
}
