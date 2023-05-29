import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { Company } from '../company/company.model';
import { Workspace } from '../workspace/workspace.model';

@ObjectType()
export class Person {
  @Field(() => ID, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: false })
  createdAt!: Date;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date;

  @Field(() => Date, { nullable: true })
  deletedAt!: Date | null;

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
  companyId!: string | null;

  @Field(() => String, { nullable: false })
  workspaceId!: string;

  @Field(() => Company, { nullable: true })
  company?: Company | null;

  @Field(() => Workspace, { nullable: false })
  workspace?: Workspace;
}
