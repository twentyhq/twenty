import { InputType, ID } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

@InputType()
export class RemoteServerIdInput {
  @IDField(() => ID, { description: 'The id of the record.' })
  id!: string;
}
