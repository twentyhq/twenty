import { Field, HideField, ObjectType } from '@nestjs/graphql';

import { Relation } from 'typeorm';

import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/role/user-workspace-role.entity';

@ObjectType()
export class RoleDTO {
  @Field({ nullable: false })
  id: string;

  @Field({ nullable: false })
  label: string;

  @Field({ nullable: false })
  canUpdateAllSettings: boolean;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: false })
  isEditable: boolean;

  @HideField()
  userWorkspaceRoles: Relation<UserWorkspaceRoleEntity[]>;

  @Field(() => [WorkspaceMember], { nullable: true })
  workspaceMembers?: WorkspaceMember[];
}
