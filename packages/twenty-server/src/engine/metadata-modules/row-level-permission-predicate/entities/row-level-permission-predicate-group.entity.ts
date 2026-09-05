/* @license Enterprise */

import {
  RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
} from 'twenty-shared/types';
import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_SHARING_RULE_PARENT_TO_ROW_LEVEL_PERMISSION_PREDICATE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-39/add-sharing-rule-parent-to-row-level-permission-predicate-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { SharingRuleEntity } from 'src/engine/metadata-modules/sharing-rule/entities/sharing-rule.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'rowLevelPermissionPredicateGroup', schema: 'core' })
@Index('IDX_RLPPG_WORKSPACE_ID_ROLE_ID_OBJECT_METADATA_ID', [
  'workspaceId',
  'roleId',
  'objectMetadataId',
])
@Index('IDX_RLPPG_PARENT_GROUP_ID', [
  'parentRowLevelPermissionPredicateGroupId',
])
@Index('IDX_RLPPG_SHARING_RULE_ID', ['sharingRuleId'])
@Check(
  'CHK_RLPPG_ROLE_OR_SHARING_RULE',
  '("roleId" IS NULL) <> ("sharingRuleId" IS NULL)',
)
export class RowLevelPermissionPredicateGroupEntity
  extends SyncableEntity
  implements
    Required<RowLevelPermissionPredicateGroupEntity>,
    RowLevelPermissionPredicateGroup
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  parentRowLevelPermissionPredicateGroupId: string | null;

  @Column({
    type: 'enum',
    enum: Object.values(RowLevelPermissionPredicateGroupLogicalOperator),
    nullable: false,
    default: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  })
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;

  @Column({ nullable: true, type: 'double precision' })
  positionInRowLevelPermissionPredicateGroup: number | null;

  @Column({ nullable: true, type: 'uuid' })
  roleId: string | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_SHARING_RULE_PARENT_TO_ROW_LEVEL_PERMISSION_PREDICATE_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: true, type: 'uuid' })
  sharingRuleId: string | null;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Relation<RoleEntity> | null;

  @ManyToOne(
    () => SharingRuleEntity,
    (sharingRule) => sharingRule.rowLevelPermissionPredicateGroups,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'sharingRuleId' })
  sharingRule: Relation<SharingRuleEntity> | null;

  @ManyToOne(() => ObjectMetadataEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity>;

  @ManyToOne(
    () => RowLevelPermissionPredicateGroupEntity,
    (rowLevelPermissionPredicateGroup) =>
      rowLevelPermissionPredicateGroup.childRowLevelPermissionPredicateGroups,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'parentRowLevelPermissionPredicateGroupId' })
  parentRowLevelPermissionPredicateGroup: Relation<RowLevelPermissionPredicateGroupEntity> | null;

  @OneToMany(
    () => RowLevelPermissionPredicateGroupEntity,
    (rowLevelPermissionPredicateGroup) =>
      rowLevelPermissionPredicateGroup.parentRowLevelPermissionPredicateGroup,
  )
  childRowLevelPermissionPredicateGroups: Relation<
    RowLevelPermissionPredicateGroupEntity[]
  >;

  @OneToMany(
    () => RowLevelPermissionPredicateEntity,
    (predicate) => predicate.rowLevelPermissionPredicateGroup,
  )
  rowLevelPermissionPredicates: Relation<RowLevelPermissionPredicateEntity[]>;
}
