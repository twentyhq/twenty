import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/role/user-workspace-role.entity';
import { SettingPermissionEntity } from 'src/engine/metadata-modules/setting-permission/setting-permission.entity';

@Entity('role')
@Unique('IndexOnRoleUnique', ['label', 'workspaceId'])
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  label: string;

  @Column({ nullable: false, default: false })
  canUpdateAllSettings: boolean;

  @Column({ nullable: false, default: false })
  canReadAllObjectRecords: boolean;

  @Column({ nullable: false, default: false })
  canUpdateAllObjectRecords: boolean;

  @Column({ nullable: false, default: false })
  canSoftDeleteAllObjectRecords: boolean;

  @Column({ nullable: false, default: false })
  canDestroyAllObjectRecords: boolean;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: false, default: true })
  isEditable: boolean;

  @OneToMany(
    () => UserWorkspaceRoleEntity,
    (userWorkspaceRole: UserWorkspaceRoleEntity) => userWorkspaceRole.role,
  )
  userWorkspaceRoles: Relation<UserWorkspaceRoleEntity[]>;

  @OneToMany(
    () => ObjectPermissionEntity,
    (objectPermission: ObjectPermissionEntity) => objectPermission.role,
  )
  objectPermissions: Relation<ObjectPermissionEntity[]>;

  @OneToMany(
    () => SettingPermissionEntity,
    (settingsPermission: SettingPermissionEntity) => settingsPermission.role,
  )
  settingsPermissions: Relation<SettingPermissionEntity[]>;
}
