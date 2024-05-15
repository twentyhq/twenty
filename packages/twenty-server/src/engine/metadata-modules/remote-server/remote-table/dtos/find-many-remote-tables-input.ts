import { InputType, ID, Field } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class FindManyRemoteTablesInput {
  @IDField(() => ID, { description: 'The id of the remote server.' })
  id!: string;

  @IsOptional()
  @Field(() => Boolean, {
    description: 'Indicates if data from distant tables should be refreshed.',
    nullable: true,
  })
  refreshData?: boolean;
}
