import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { type PermissionFlagPermissionType } from 'src/engine/metadata-modules/permission-flag/constants/permission-flag-permission-type.constant';
import { RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity('permissionFlag')
@WasIntroducedInUpgrade({
  upgradeCommandName:
    '2.6.0_PermissionFlagSyncableEntityFastInstanceCommand_1778235340021',
})
@Unique('IDX_PERMISSION_FLAG_KEY_WORKSPACE_ID_UNIQUE', ['key', 'workspaceId'])
@Index('IDX_PERMISSION_FLAG_APPLICATION_ID', ['applicationId'])
export class PermissionFlagEntity extends SyncableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'varchar' })
  key: string;

  @Column({ nullable: false, type: 'varchar' })
  label: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({ nullable: false, type: 'varchar' })
  permissionType: PermissionFlagPermissionType;

  @OneToMany(
    () => RolePermissionFlagEntity,
    (rolePermissionFlag) => rolePermissionFlag.permissionFlag,
  )
  rolePermissionFlags: Relation<RolePermissionFlagEntity[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
