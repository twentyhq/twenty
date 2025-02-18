import { Field, HideField, ObjectType } from '@nestjs/graphql';

import { Relation } from 'typeorm';

import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/role/user-workspace-role.entity';

@ObjectType('Role')
export class RoleDTO {
  @Field({ nullable: false })
  id: string;

  @Field({ nullable: false })
  label: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: false })
  isEditable: boolean;

  @HideField()
  userWorkspaceRoles: Relation<UserWorkspaceRoleEntity[]>;

  @Field(() => [WorkspaceMember], { nullable: true })
  workspaceMembers?: WorkspaceMember[];

  @Field({ nullable: false })
  canUpdateAllSettings: boolean;

  @Field({ nullable: false })
  canReadAllObjectRecords: boolean;

  @Field({ nullable: false })
  canUpdateAllObjectRecords: boolean;

  @Field({ nullable: false })
  canSoftDeleteAllObjectRecords: boolean;

  @Field({ nullable: false })
  canDestroyAllObjectRecords: boolean;
}
