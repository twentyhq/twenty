import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class WorkspaceByInviteHashInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  inviteHash: string;
}
