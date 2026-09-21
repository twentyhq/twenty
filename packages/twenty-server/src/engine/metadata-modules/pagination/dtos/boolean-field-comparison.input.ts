import { Field, InputType } from '@nestjs/graphql';

@InputType('BooleanFieldComparison')
export class BooleanFieldComparisonInput {
  @Field(() => Boolean, { nullable: true })
  is?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  isNot?: boolean | null;
}
