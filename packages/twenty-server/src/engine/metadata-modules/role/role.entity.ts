import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';

@Entity('role')
@Unique('IDX_ROLE_LABEL_WORKSPACE_ID_UNIQUE', ['label', 'workspaceId'])
export class RoleEntity extends SyncableEntity implements Required<RoleEntity> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  standardId: string | null;

  @Column({ nullable: false })
  label: string;

  @Column({ nullable: false, default: false })
  canUpdateAllSettings: boolean;

  @Column({ nullable: false, default: false })
  canAccessAllTools: boolean;

  @Column({ nullable: false, default: false })
  canReadAllObjectRecords: boolean;

  @Column({ nullable: false, default: false })
  canUpdateAllObjectRecords: boolean;

  @Column({ nullable: false, default: false })
  canSoftDeleteAllObjectRecords: boolean;

  @Column({ nullable: false, default: false })
  canDestroyAllObjectRecords: boolean;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: false, default: true })
  isEditable: boolean;

  @Column({ nullable: false, default: true })
  canBeAssignedToUsers: boolean;

  @Column({ nullable: false, default: true })
  canBeAssignedToAgents: boolean;

  @Column({ nullable: false, default: true })
  canBeAssignedToApiKeys: boolean;

  @OneToMany(
    () => RoleTargetEntity,
    (roleTargets: RoleTargetEntity) => roleTargets.role,
  )
  roleTargets: Relation<RoleTargetEntity[]>;

  @OneToMany(
    () => ObjectPermissionEntity,
    (objectPermission: ObjectPermissionEntity) => objectPermission.role,
  )
  objectPermissions: Relation<ObjectPermissionEntity[]>;

  @OneToMany(
    () => PermissionFlagEntity,
    (permissionFlag: PermissionFlagEntity) => permissionFlag.role,
  )
  permissionFlags: Relation<PermissionFlagEntity[]>;

  @OneToMany(
    () => FieldPermissionEntity,
    (fieldPermission: FieldPermissionEntity) => fieldPermission.role,
  )
  fieldPermissions: Relation<FieldPermissionEntity[]>;
}
