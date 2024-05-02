import { ObjectType, Field } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';

@ObjectType('UserMappingOptionsUser')
export class UserMappingOptionsDTO {
  @IsOptional()
  @Field(() => String, { nullable: true })
  user: string;
}
