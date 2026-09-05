import {
  type RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';
import {
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

import { ADD_SHARING_RULE_TABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-39/add-sharing-rule-table-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { SHARING_RULE_ACCESS_LEVELS } from 'src/engine/metadata-modules/sharing-rule/constants/sharing-rule-access-levels.constant';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'sharingRule', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_SHARING_RULE_TABLE_UPGRADE_COMMAND_NAME,
})
@Index('IDX_SHARING_RULE_WORKSPACE_ID_OBJECT_METADATA_ID', [
  'workspaceId',
  'objectMetadataId',
])
@Index('IDX_SHARING_RULE_GRANTEE_ROLE_ID', ['granteeRoleId'])
export class SharingRuleEntity
  extends SyncableEntity
  implements Required<SharingRuleEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @ManyToOne(() => ObjectMetadataEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity>;

  @Column({ nullable: false, type: 'text' })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Object.values(RecordSharePrincipalType),
  })
  granteePrincipalType: RecordSharePrincipalType;

  @Column({ nullable: true, type: 'uuid' })
  granteeRoleId: string | null;

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'granteeRoleId' })
  granteeRole: Relation<RoleEntity> | null;

  @Column({ nullable: true, type: 'uuid' })
  granteePrincipalId: string | null;

  @Column({
    nullable: false,
    type: 'enum',
    enum: SHARING_RULE_ACCESS_LEVELS,
  })
  accessLevel: RecordShareAccessLevel;

  @Column({ nullable: false, type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;

  @OneToMany(
    () => RowLevelPermissionPredicateEntity,
    (rowLevelPermissionPredicate: RowLevelPermissionPredicateEntity) =>
      rowLevelPermissionPredicate.sharingRule,
  )
  rowLevelPermissionPredicates: Relation<RowLevelPermissionPredicateEntity[]>;

  @OneToMany(
    () => RowLevelPermissionPredicateGroupEntity,
    (
      rowLevelPermissionPredicateGroup: RowLevelPermissionPredicateGroupEntity,
    ) => rowLevelPermissionPredicateGroup.sharingRule,
  )
  rowLevelPermissionPredicateGroups: Relation<
    RowLevelPermissionPredicateGroupEntity[]
  >;
}
