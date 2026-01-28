import { ID, InputType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

@InputType()
export class PublishLogicFunctionInput {
  @IDField(() => ID, { description: 'The id of the function.' })
  id!: string;
}
