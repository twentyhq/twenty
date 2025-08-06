import { Field, HideField, ObjectType } from '@nestjs/graphql';

import { Relation } from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { FieldPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/field-permission.dto';
import { ObjectPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/object-permission.dto';
import { PermissionFlagDTO } from 'src/engine/metadata-modules/permission-flag/dtos/permission-flag.dto';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';

@ObjectType('Role')
export class RoleDTO {
  @Field(() => UUIDScalarType, { nullable: false })
  id: string;

  @Field({ nullable: false })
  label: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  icon: string;

  @Field({ nullable: false })
  isEditable: boolean;

  @HideField()
  roleTargets: Relation<RoleTargetsEntity[]>;

  @Field(() => [WorkspaceMember], { nullable: true })
  workspaceMembers?: WorkspaceMember[];

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
