import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { User } from '../user/user.model';
import { Person } from '../person/person.model';
import { Workspace } from '../workspace/workspace.model';
import { CompanyCount } from './company-count.output';

@ObjectType()
export class Company {
  @Field(() => ID, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: false })
  createdAt!: Date;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date;

  @Field(() => Date, { nullable: true })
  deletedAt!: Date | null;

  @Field(() => String, { nullable: false })
  name!: string;

  @Field(() => String, { nullable: false })
  domainName!: string;

  @Field(() => String, { nullable: false })
  address!: string;

  @Field(() => Int, { nullable: true })
  employees!: number | null;

  @Field(() => String, { nullable: true })
  accountOwnerId!: string | null;

  @HideField()
  workspaceId!: string;

  @Field(() => User, { nullable: true })
  accountOwner?: User | null;

  @Field(() => [Person], { nullable: true })
  people?: Array<Person>;

  @HideField()
  workspace?: Workspace;

  @HideField()
  _count?: CompanyCount;
}
