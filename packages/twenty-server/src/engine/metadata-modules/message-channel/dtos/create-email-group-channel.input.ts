import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType('CreateEmailGroupChannelInput')
export class CreateEmailGroupChannelInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(254)
  handle: string;
}
