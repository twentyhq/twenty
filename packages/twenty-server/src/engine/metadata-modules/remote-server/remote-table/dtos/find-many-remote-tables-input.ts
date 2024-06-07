import { InputType, ID, Field } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class FindManyRemoteTablesInput {
  @IDField(() => ID, { description: 'The id of the remote server.' })
  id!: string;

  @IsOptional()
  @Field(() => Boolean, {
    description:
      'Indicates if pending schema updates status should be computed.',
    nullable: true,
  })
  shouldFetchPendingSchemaUpdates?: boolean;
}
