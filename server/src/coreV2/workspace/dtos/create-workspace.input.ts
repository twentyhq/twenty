import { Field, InputType } from '@nestjs/graphql';

import { IsString, IsOptional } from 'class-validator';

@InputType()
export class CreateWorkspaceInput {
  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  domainName?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  displayName?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  logo?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  inviteHash?: string;
}
