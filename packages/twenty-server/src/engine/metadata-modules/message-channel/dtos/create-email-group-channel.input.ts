import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

@InputType('CreateEmailGroupChannelInput')
export class CreateEmailGroupChannelInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(254)
  handle: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;
}
