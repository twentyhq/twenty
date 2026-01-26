import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ObjectType('FrontComponentCode')
export class FrontComponentCodeDTO {
  @IsString()
  @IsNotEmpty()
  @Field()
  sourceCode: string;
}
