import { Field, ID, InputType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

@InputType()
export class GetServerlessFunctionSourceCodeInput {
  @IDField(() => ID, { description: 'The id of the function.' })
  id!: string;

  @Field(() => String, {
    nullable: false,
    description: 'The version of the function',
    defaultValue: 'draft',
  })
  version: string;
}
