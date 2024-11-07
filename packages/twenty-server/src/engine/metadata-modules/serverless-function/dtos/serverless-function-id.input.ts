import { ID, InputType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

@InputType()
export class ServerlessFunctionIdInput {
  @IDField(() => ID, { description: 'The id of the function.' })
  id!: string;
}
