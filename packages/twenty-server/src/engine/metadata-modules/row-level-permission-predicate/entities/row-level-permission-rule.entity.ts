/* @license Enterprise */

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_ROW_LEVEL_PERMISSION_RULE_TABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-58/add-row-level-permission-rule-table-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'rowLevelPermissionRule', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_ROW_LEVEL_PERMISSION_RULE_TABLE_UPGRADE_COMMAND_NAME,
})
@Index('IDX_RLPR_WORKSPACE_ID_ROLE_ID_OBJECT_METADATA_ID', [
  'workspaceId',
  'roleId',
  'objectMetadataId',
])
export class RowLevelPermissionRuleEntity
  extends SyncableEntity
  implements Required<RowLevelPermissionRuleEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @Column({ nullable: false, type: 'boolean', default: false })
  canReadRecords: boolean;

  @Column({ nullable: false, type: 'boolean', default: false })
  canCreateRecords: boolean;

  @Column({ nullable: false, type: 'boolean', default: false })
  canUpdateRecords: boolean;

  @Column({ nullable: false, type: 'boolean', default: false })
  canSoftDeleteRecords: boolean;

  @Column({ nullable: false, type: 'boolean', default: false })
  canDestroyRecords: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => RoleEntity, (role) => role.rowLevelPermissionRules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Relation<RoleEntity>;

  @ManyToOne(
    () => ObjectMetadataEntity,
    (objectMetadata) => objectMetadata.rowLevelPermissionRules,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity>;
}
