/* @license Enterprise */

import {
  RowLevelPermissionPredicate,
  RowLevelPermissionPredicateOperand,
  RowLevelPermissionPredicateValue,
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
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_SHARING_RULE_PARENT_TO_ROW_LEVEL_PERMISSION_PREDICATE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-39/add-sharing-rule-parent-to-row-level-permission-predicate-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { SharingRuleEntity } from 'src/engine/metadata-modules/sharing-rule/entities/sharing-rule.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

@Entity({ name: 'rowLevelPermissionPredicate', schema: 'core' })
@Index('IDX_RLPP_WORKSPACE_ID_ROLE_ID_OBJECT_METADATA_ID', [
  'workspaceId',
  'roleId',
  'objectMetadataId',
])
@Index('IDX_RLPP_FIELD_METADATA_ID', ['fieldMetadataId'])
@Index('IDX_RLPP_GROUP_ID', ['rowLevelPermissionPredicateGroupId'])
@Index('IDX_RLPP_WORKSPACE_MEMBER_FIELD_METADATA_ID', [
  'workspaceMemberFieldMetadataId',
])
@Index('IDX_RLPP_SHARING_RULE_ID', ['sharingRuleId'])
@Check(
  'CHK_RLPP_ROLE_OR_SHARING_RULE',
  '("roleId" IS NULL) <> ("sharingRuleId" IS NULL)',
)
export class RowLevelPermissionPredicateEntity
  extends SyncableEntity
  implements
    Required<RowLevelPermissionPredicateEntity>,
    Omit<RowLevelPermissionPredicate, 'roleId'>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  fieldMetadataId: string;

  @ManyToOne(() => FieldMetadataEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fieldMetadataId' })
  fieldMetadata: Relation<FieldMetadataEntity>;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @ManyToOne(() => ObjectMetadataEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity>;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Object.values(RowLevelPermissionPredicateOperand),
    default: RowLevelPermissionPredicateOperand.CONTAINS,
  })
  operand: RowLevelPermissionPredicateOperand;

  @Column({ nullable: true, type: 'jsonb' })
  value: JsonbProperty<RowLevelPermissionPredicateValue> | null;

  @Column({ nullable: true, type: 'text', default: null })
  subFieldName: string | null;

  @Column({ nullable: true, type: 'uuid' })
  workspaceMemberFieldMetadataId: string | null;

  @Column({ nullable: true, type: 'text', default: null })
  workspaceMemberSubFieldName: string | null;

  @ManyToOne(() => FieldMetadataEntity, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'workspaceMemberFieldMetadataId' })
  workspaceMemberFieldMetadata: Relation<FieldMetadataEntity> | null;

  @Column({ nullable: true, type: 'uuid' })
  rowLevelPermissionPredicateGroupId: string | null;

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
    (sharingRule) => sharingRule.rowLevelPermissionPredicates,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'sharingRuleId' })
  sharingRule: Relation<SharingRuleEntity> | null;

  @ManyToOne(
    () => RowLevelPermissionPredicateGroupEntity,
    (rowLevelPermissionPredicateGroup) =>
      rowLevelPermissionPredicateGroup.rowLevelPermissionPredicates,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'rowLevelPermissionPredicateGroupId' })
  rowLevelPermissionPredicateGroup: Relation<RowLevelPermissionPredicateGroupEntity> | null;
}
