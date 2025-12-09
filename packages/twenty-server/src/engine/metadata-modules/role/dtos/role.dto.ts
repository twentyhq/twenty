import { Field, HideField, ObjectType } from '@nestjs/graphql';

import { Relation } from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceMemberDTO } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { AgentDTO } from 'src/engine/metadata-modules/ai/ai-agent/dtos/agent.dto';
import { FieldPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/field-permission.dto';
import { ObjectPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/object-permission.dto';
import { PermissionFlagDTO } from 'src/engine/metadata-modules/permission-flag/dtos/permission-flag.dto';
import { type RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';

@ObjectType('ApiKeyForRole')
export class ApiKeyForRoleDTO {
  @Field(() => UUIDScalarType, { nullable: false })
  id: string;

  @Field({ nullable: false })
  name: string;

  @Field(() => Date, { nullable: false })
  expiresAt: Date;

  @Field(() => Date, { nullable: true })
  revokedAt?: Date | null;
}

@ObjectType('Role')
export class RoleDTO {
  @Field(() => UUIDScalarType, { nullable: false })
  id: string;

  @Field(() => UUIDScalarType, { nullable: true })
  standardId?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  universalIdentifier?: string;

  @Field({ nullable: false })
  label: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: false })
  isEditable: boolean;

  @Field({ nullable: false })
  canBeAssignedToUsers: boolean;

  @Field({ nullable: false })
  canBeAssignedToAgents: boolean;

  @Field({ nullable: false })
  canBeAssignedToApiKeys: boolean;

  @HideField()
  roleTargets?: Relation<RoleTargetEntity[]>;

  @Field(() => [WorkspaceMemberDTO], { nullable: true })
  workspaceMembers?: WorkspaceMemberDTO[];

  @Field(() => [AgentDTO], { nullable: true })
  agents?: AgentDTO[];

  @Field(() => [ApiKeyForRoleDTO], { nullable: true })
  apiKeys?: ApiKeyForRoleDTO[];

  @Field({ nullable: false })
  canUpdateAllSettings: boolean;

  @Field({ nullable: false })
  canAccessAllTools: boolean;

  @Field({ nullable: false })
  canReadAllObjectRecords: boolean;

  @Field({ nullable: false })
  canUpdateAllObjectRecords: boolean;

  @Field({ nullable: false })
  canSoftDeleteAllObjectRecords: boolean;

  @Field({ nullable: false })
  canDestroyAllObjectRecords: boolean;

  @Field(() => [PermissionFlagDTO], { nullable: true })
  permissionFlags?: PermissionFlagDTO[];

  @Field(() => [ObjectPermissionDTO], { nullable: true })
  objectPermissions?: ObjectPermissionDTO[];

  @Field(() => [FieldPermissionDTO], { nullable: true })
  fieldPermissions?: FieldPermissionDTO[];
}
