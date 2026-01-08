/* @license Enterprise */

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

import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { RowLevelPermissionPredicateGroupLogicalOperator } from 'src/engine/metadata-modules/row-level-permission-predicate/enums/row-level-permission-predicate-group-logical-operator.enum';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';

@Entity({ name: 'rowLevelPermissionPredicateGroup', schema: 'core' })
@Index('IDX_RLPPG_WORKSPACE_ID_ROLE_ID', ['workspaceId', 'roleId'])
export class RowLevelPermissionPredicateGroupEntity
  extends SyncableEntity
  implements Required<RowLevelPermissionPredicateGroupEntity>
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
      rowLevelPermissionPredicateGroup.childRowLevelPermissionPredicateGroups,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'parentRowLevelPermissionPredicateGroupId' })
  parentRowLevelPermissionPredicateGroup: Relation<RowLevelPermissionPredicateGroupEntity>;

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
