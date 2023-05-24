import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { Person as PersonDB } from '@prisma/client';
import { Company } from './company.model';
import { FilterableField } from '@ptc-org/nestjs-query-graphql';

@ObjectType()
export class Person {
  @Field(() => String)
  id: PersonDB[`id`];

  @FilterableField(() => GraphQLISODateTime)
  createdAt: PersonDB[`createdAt`];

  @FilterableField(() => GraphQLISODateTime)
  updatedAt: PersonDB[`updatedAt`];

  @FilterableField(() => GraphQLISODateTime, { nullable: true })
  deletedAt: PersonDB[`deletedAt`];

  @FilterableField(() => String)
  firstname: PersonDB[`firstname`];

  @FilterableField(() => String)
  lastname: PersonDB[`lastname`];

  @FilterableField(() => String)
  email: PersonDB[`email`];

  @FilterableField(() => String)
  phone: PersonDB[`phone`];

  @FilterableField(() => String)
  city: PersonDB[`city`];

  @FilterableField(() => String, { nullable: true })
  companyId: PersonDB[`companyId`];

  @Field(() => Company, { nullable: true })
  company: Company;
}
