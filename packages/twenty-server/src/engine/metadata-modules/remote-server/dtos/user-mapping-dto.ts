import { ObjectType, Field } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';

@ObjectType('UserMappingOptionsUsername')
export class UserMappingOptionsDTO {
  @IsOptional()
  @Field(() => String, { nullable: true })
  username: string;
}
