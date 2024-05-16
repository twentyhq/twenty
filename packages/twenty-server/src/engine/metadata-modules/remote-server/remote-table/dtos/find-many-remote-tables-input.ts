import { InputType, ID } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

@InputType()
export class FindManyRemoteTablesInput {
  @IDField(() => ID, { description: 'The id of the remote server.' })
  id!: string;
}
