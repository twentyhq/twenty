import { Field, InputType } from '@nestjs/graphql';

import { IsObject, IsString } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

@InputType()
export class LogicFunctionSourceInput {
  @IsString()
  @Field({ nullable: false })
  sourceHandlerCode: string;

  @Field(() => graphqlTypeJson, { nullable: false })
  @IsObject()
  toolInputSchema: object;

  @IsString()
  @Field({ nullable: false })
  handlerName: string;
}
