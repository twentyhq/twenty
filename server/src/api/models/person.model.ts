import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { Person as PersonDB } from '@prisma/client';
import { Company } from './company.model';

@ObjectType()
export class Person {
  @Field(() => String)
  id: PersonDB[`id`];

  @Field(() => GraphQLISODateTime)
  createdAt: PersonDB[`createdAt`];

  @Field(() => GraphQLISODateTime)
  updatedAt: PersonDB[`updatedAt`];

  @Field(() => GraphQLISODateTime, { nullable: true })
  deletedAt: PersonDB[`deletedAt`];

  @Field(() => String)
  firstname: PersonDB[`firstname`];

  @Field(() => String)
  lastname: PersonDB[`lastname`];

  @Field(() => String)
  email: PersonDB[`email`];

  @Field(() => String)
  phone: PersonDB[`phone`];

  @Field(() => String)
  city: PersonDB[`city`];

  @Field(() => String, { nullable: true })
  companyId: PersonDB[`companyId`];

  @Field(() => Company, { nullable: true })
  company: Company;
}
