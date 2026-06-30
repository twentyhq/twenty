import { Field, InputType } from '@nestjs/graphql';

import { IsString, Matches } from 'class-validator';

import { HANDLER_NAME_REGEX } from 'src/engine/metadata-modules/logic-function/constants/handler.contant';

@InputType()
export class LogicFunctionSourceInput {
  @IsString()
  @Field({ nullable: false })
  sourceHandlerCode: string;

  @IsString()
  @Matches(HANDLER_NAME_REGEX, {
    message: 'handlerName must be a valid JavaScript identifier or dotted path',
  })
  @Field({ nullable: false })
  handlerName: string;
}
