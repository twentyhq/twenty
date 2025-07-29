import { Field, InputType } from '@nestjs/graphql';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';

@InputType()
export class UpdateViewFieldInput {
  @Field({ nullable: true })
  isVisible?: boolean;

  @Field({ nullable: true })
  size?: number;

  @Field({ nullable: true })
  position?: number;

  @Field(() => AggregateOperations, { nullable: true })
  aggregateOperation?: AggregateOperations;
}
