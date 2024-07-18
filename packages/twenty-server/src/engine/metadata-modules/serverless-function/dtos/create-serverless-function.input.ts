import { Field, HideField, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateServerlessFunctionInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @HideField()
  workspaceId: string;
}
