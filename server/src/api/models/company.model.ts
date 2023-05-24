import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { Company as CompanyDB } from '@prisma/client';

@ObjectType()
export class Company {
  @Field(() => String)
  id: CompanyDB[`id`];

  @Field(() => GraphQLISODateTime)
  createdAt: CompanyDB[`createdAt`];

  @Field(() => GraphQLISODateTime)
  updatedAt: CompanyDB[`updatedAt`];

  @Field(() => GraphQLISODateTime, { nullable: true })
  deletedAt: CompanyDB[`deletedAt`];

  @Field(() => String)
  name: CompanyDB[`name`];

  @Field(() => String)
  domainName: CompanyDB[`domainName`];

  @Field(() => String)
  address: CompanyDB[`address`];

  @Field(() => Int)
  employees: CompanyDB[`employees`];
}