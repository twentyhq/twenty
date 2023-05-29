import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { User } from '../user/user.model';
import { Workspace } from '../workspace/workspace.model';

@ObjectType()
export class WorkspaceMember {
  @Field(() => ID, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: false })
  createdAt!: Date;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date;

  @Field(() => Date, { nullable: true })
  deletedAt!: Date | null;

  @Field(() => String, { nullable: false })
  userId!: string;

  @Field(() => String, { nullable: false })
  workspaceId!: string;

  @Field(() => User, { nullable: false })
  user?: User;

  @Field(() => Workspace, { nullable: false })
  workspace?: Workspace;
}
