import { ValidateBy } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_ROW_LEVEL_PERMISSION_RULE_LINKS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-58/add-row-level-permission-rule-links-upgrade-command-name.constant';
import { ADD_RLS_RULE_FIELD_PERMISSIONS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-57/add-rls-rule-field-permissions-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionRuleEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-rule.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity('fieldPermission')
@Index(
  'IDX_FIELD_PERMISSION_OBJECT_LEVEL_FIELD_ROLE_UNIQUE',
  ['fieldMetadataId', 'roleId'],
  { unique: true, where: '"rowLevelPermissionPredicateGroupId" IS NULL' },
)
@Index(
  'IDX_FIELD_PERMISSION_RLS_RULE_FIELD_ROLE_GROUP_UNIQUE',
  ['fieldMetadataId', 'roleId', 'rowLevelPermissionPredicateGroupId'],
  { unique: true, where: '"rowLevelPermissionPredicateGroupId" IS NOT NULL' },
)
@Index('IDX_FIELD_PERMISSION_WORKSPACE_ID_ROLE_ID', ['workspaceId', 'roleId'])
@Index('IDX_FIELD_PERMISSION_RULE_ID', ['rowLevelPermissionRuleId'])
export class FieldPermissionEntity extends SyncableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @ManyToOne(() => RoleEntity, (role) => role.fieldPermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Relation<RoleEntity>;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @Column({ nullable: false, type: 'uuid' })
  fieldMetadataId: string;

  @ManyToOne(
    () => ObjectMetadataEntity,
    (objectMetadata) => objectMetadata.fieldPermissions,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity>;

  @ManyToOne(
    () => FieldMetadataEntity,
    (fieldMetadata) => fieldMetadata.fieldPermissions,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'fieldMetadataId' })
  fieldMetadata: Relation<FieldMetadataEntity>;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_RLS_RULE_FIELD_PERMISSIONS_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: true, type: 'uuid' })
  rowLevelPermissionPredicateGroupId: string | null;

  @ManyToOne(() => RowLevelPermissionPredicateGroupEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'rowLevelPermissionPredicateGroupId' })
  rowLevelPermissionPredicateGroup: Relation<RowLevelPermissionPredicateGroupEntity> | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_ROW_LEVEL_PERMISSION_RULE_LINKS_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: true, type: 'uuid' })
  rowLevelPermissionRuleId: string | null;

  @ManyToOne(() => RowLevelPermissionRuleEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'rowLevelPermissionRuleId' })
  rowLevelPermissionRule: Relation<RowLevelPermissionRuleEntity> | null;

  @Column({ nullable: true, type: 'boolean' })
  canReadFieldValue?: boolean | null;

  @ValidateBy({
    name: 'isFalseOrNull',
    validator: {
      validate: (value: boolean | null) => value === false || value === null,
      defaultMessage: () => 'value must be either false or null',
    },
  })
  @Column({ nullable: true, type: 'boolean' })
  canUpdateFieldValue?: boolean | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
