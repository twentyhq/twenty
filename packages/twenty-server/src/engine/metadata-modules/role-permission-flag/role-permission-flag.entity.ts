import { PermissionFlagType } from 'twenty-shared/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WasRemovedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';
import { WasRenamedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity('rolePermissionFlag')
@WasRenamedInUpgrade([
  {
    previousName: 'permissionFlag',
    upgradeCommandName:
      '2.6.0_RenamePermissionFlagToRolePermissionFlagFastInstanceCommand_1778235340020',
  },
])
@Unique('IDX_ROLE_PERMISSION_FLAG_PERMISSION_FLAG_ID_ROLE_ID_UNIQUE', [
  'permissionFlagId',
  'roleId',
])
@Index('IDX_ROLE_PERMISSION_FLAG_ROLE_ID', ['roleId'])
@Index('IDX_ROLE_PERMISSION_FLAG_PERMISSION_FLAG_ID', ['permissionFlagId'])
export class RolePermissionFlagEntity extends SyncableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @ManyToOne(() => RoleEntity, (role) => role.rolePermissionFlags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Relation<RoleEntity>;

  @WasRemovedInUpgrade({
    upgradeCommandName:
      '2.7.0_FinalizeRolePermissionFlagCutoverFastInstanceCommand_1779600000000',
  })
  @Column({ nullable: false, type: 'varchar' })
  flag: PermissionFlagType;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      '2.6.0_LinkRolePermissionFlagToPermissionFlagFastInstanceCommand_1778235340022',
  })
  @Column({ nullable: false, type: 'uuid' })
  permissionFlagId: string;

  @ManyToOne(
    () => PermissionFlagEntity,
    (permissionFlag) => permissionFlag.rolePermissionFlags,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'permissionFlagId' })
  permissionFlag: Relation<PermissionFlagEntity>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
