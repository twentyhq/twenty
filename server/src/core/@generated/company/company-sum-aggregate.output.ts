import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';

@ObjectType()
export class CompanySumAggregate {
  @Field(() => Int, { nullable: true })
  employees?: number;
}
