import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';

@InputType()
export class CompanyAvgAggregateInput {
  @Field(() => Boolean, { nullable: true })
  employees?: true;
}
