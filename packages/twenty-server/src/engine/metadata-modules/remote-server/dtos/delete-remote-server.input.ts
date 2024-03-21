import { InputType, ID } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

@InputType()
export class DeleteRemoteServerInput {
  @IDField(() => ID, { description: 'The id of the record to delete.' })
  id!: string;
}
