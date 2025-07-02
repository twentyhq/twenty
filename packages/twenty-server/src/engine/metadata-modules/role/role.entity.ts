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
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { SettingPermissionEntity } from 'src/engine/metadata-modules/setting-permission/setting-permission.entity';

@Entity('role')
@Unique('IDX_ROLE_LABEL_WORKSPACE_ID_UNIQUE', ['label', 'workspaceId'])
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
    () => RoleTargetsEntity,
    (roleTargets: RoleTargetsEntity) => roleTargets.role,
  )
  roleTargets: Relation<RoleTargetsEntity[]>;

  @OneToMany(
    () => ObjectPermissionEntity,
    (objectPermission: ObjectPermissionEntity) => objectPermission.role,
  )
  objectPermissions: Relation<ObjectPermissionEntity[]>;

  @OneToMany(
    () => SettingPermissionEntity,
    (settingPermission: SettingPermissionEntity) => settingPermission.role,
  )
  settingPermissions: Relation<SettingPermissionEntity[]>;
}
