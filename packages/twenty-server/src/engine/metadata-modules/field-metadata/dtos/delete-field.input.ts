import { InputType, ID } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

@InputType()
export class DeleteOneFieldInput {
  @IDField(() => ID, { description: 'The id of the field to delete.' })
  id!: string;
}
