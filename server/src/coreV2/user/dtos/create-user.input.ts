import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @Field()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @Field()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @Field()
  @IsOptional()
  @IsString()
  passwordHash?: string;
}
