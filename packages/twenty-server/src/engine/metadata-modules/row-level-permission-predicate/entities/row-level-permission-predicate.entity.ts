/* @license Enterprise */

import {
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

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionPredicateOperand } from 'src/engine/metadata-modules/row-level-permission-predicate/enums/row-level-permission-predicate-operand';
import { type RowLevelPermissionPredicateValue } from 'src/engine/metadata-modules/row-level-permission-predicate/types/row-level-permission-predicate-value.type';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';

@Entity({ name: 'rowLevelPermissionPredicate', schema: 'core' })
@Index('IDX_RLPP_WORKSPACE_ID_ROLE_ID_OBJECT_METADATA_ID', [
  'workspaceId',
  'roleId',
  'objectMetadataId',
])
@Index('IDX_RLPP_FIELD_METADATA_ID', ['fieldMetadataId'])
@Index('IDX_RLPP_GROUP_ID', ['rowLevelPermissionPredicateGroupId'])
export class RowLevelPermissionPredicateEntity
  extends SyncableEntity
  implements Required<RowLevelPermissionPredicateEntity>
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
  value: RowLevelPermissionPredicateValue | null;

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
  workspaceMemberFieldMetadata: Relation<FieldMetadataEntity>;

  @Column({ nullable: true, type: 'uuid' })
  rowLevelPermissionPredicateGroupId: string | null;

  @Column({ nullable: true, type: 'double precision' })
  positionInRowLevelPermissionPredicateGroup: number | null;

  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Relation<RoleEntity>;

  @ManyToOne(
    () => RowLevelPermissionPredicateGroupEntity,
    (rowLevelPermissionPredicateGroup) =>
      rowLevelPermissionPredicateGroup.rowLevelPermissionPredicates,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'rowLevelPermissionPredicateGroupId' })
  rowLevelPermissionPredicateGroup: Relation<RowLevelPermissionPredicateGroupEntity>;
}
