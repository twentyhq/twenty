import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { PersonCountAggregate } from './person-count-aggregate.output';
import { PersonMinAggregate } from './person-min-aggregate.output';
import { PersonMaxAggregate } from './person-max-aggregate.output';

@ObjectType()
export class PersonGroupBy {
  @Field(() => String, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: false })
  createdAt!: Date | string;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => String, { nullable: false })
  firstname!: string;

  @Field(() => String, { nullable: false })
  lastname!: string;

  @Field(() => String, { nullable: false })
  email!: string;

  @Field(() => String, { nullable: false })
  phone!: string;

  @Field(() => String, { nullable: false })
  city!: string;

  @Field(() => String, { nullable: true })
  companyId?: string;

  @Field(() => String, { nullable: false })
  workspaceId!: string;

  @Field(() => PersonCountAggregate, { nullable: true })
  _count?: PersonCountAggregate;

  @Field(() => PersonMinAggregate, { nullable: true })
  _min?: PersonMinAggregate;

  @Field(() => PersonMaxAggregate, { nullable: true })
  _max?: PersonMaxAggregate;
}
