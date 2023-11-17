import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// FIXME: We might not need this
@InputType()
export class UpdateWorkspaceInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  domainName?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  displayName?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  logo?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  inviteHash?: string;
}
