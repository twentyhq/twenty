import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType('CreateEmailGroupChannelInput')
export class CreateEmailGroupChannelInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  handle: string;
}
