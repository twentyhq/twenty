import { Field, ObjectType } from '@nestjs/graphql';

import { IsOptional, IsString, IsUrl } from 'class-validator';

@ObjectType('IframeConfiguration')
export class IframeConfigurationDTO {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @IsUrl()
  url?: string;
}
