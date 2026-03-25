import { Field, InputType } from '@nestjs/graphql';

import { IsObject, IsString, Matches } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

import { HANDLER_NAME_REGEX } from 'src/engine/metadata-modules/logic-function/constants/handler.contant';

@InputType()
export class LogicFunctionSourceInput {
  @IsString()
  @Field({ nullable: false })
  sourceHandlerCode: string;

  @Field(() => graphqlTypeJson, { nullable: false })
  @IsObject()
  toolInputSchema: object;

  @IsString()
  @Matches(HANDLER_NAME_REGEX, {
    message: 'handlerName must be a valid JavaScript identifier or dotted path',
  })
  @Field({ nullable: false })
  handlerName: string;
}
