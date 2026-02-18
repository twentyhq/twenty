import { Field, InputType } from '@nestjs/graphql';

import { IsObject, IsString, Matches } from 'class-validator';
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
  @Matches(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, {
    message: 'handlerName must be a valid JavaScript identifier',
  })
  @Field({ nullable: false })
  handlerName: string;
}
