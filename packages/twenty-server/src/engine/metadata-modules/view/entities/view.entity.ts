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
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';
import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { ViewCalendarLayout } from 'src/engine/metadata-modules/view/enums/view-calendar-layout.enum';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import { ViewOpenRecordIn } from 'src/engine/metadata-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { ViewVisibility } from 'src/engine/metadata-modules/view/enums/view-visibility.enum';

// We could refactor this type to be dynamic to view type
@Entity({ name: 'view', schema: 'core' })
@Index('IDX_VIEW_WORKSPACE_ID_OBJECT_METADATA_ID', [
  'workspaceId',
  'objectMetadataId',
])
@Index('IDX_VIEW_VISIBILITY', ['visibility'])
@Check(
  'CHK_VIEW_CALENDAR_INTEGRITY',
  `("type" != 'CALENDAR' OR ("calendarLayout" IS NOT NULL AND "calendarFieldMetadataId" IS NOT NULL))`,
)
export class ViewEntity extends SyncableEntity implements Required<ViewEntity> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'text', default: '' })
  name: string;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @ManyToOne(() => ObjectMetadataEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity>;

  @Column({
    type: 'enum',
    enum: Object.values(ViewType),
    nullable: false,
    default: ViewType.TABLE,
  })
  type: ViewType;

  @Column({
    type: 'enum',
    enum: Object.values(ViewKey),
    nullable: true,
    default: null,
  })
  key: ViewKey | null;

  @Column({ nullable: false, type: 'text' })
  icon: string;

  @Column({ nullable: false, type: 'double precision', default: 0 })
  position: number;

  @Column({ nullable: false, default: false, type: 'boolean' })
  isCompact: boolean;

  @Column({ nullable: false, default: false, type: 'boolean' })
  isCustom: boolean;

  @Column({
    type: 'enum',
    enum: Object.values(ViewOpenRecordIn),
    nullable: false,
    default: ViewOpenRecordIn.SIDE_PANEL,
  })
  openRecordIn: ViewOpenRecordIn;

  @Column({
    type: 'enum',
    enum: Object.values(AggregateOperations),
    nullable: true,
    default: null,
  })
  kanbanAggregateOperation: AggregateOperations | null;

  @Column({ nullable: true, type: 'uuid' })
  kanbanAggregateOperationFieldMetadataId: string | null;

  @ManyToOne(
    () => FieldMetadataEntity,
    (FieldMetadataEntity) => FieldMetadataEntity.kanbanAggregateOperationViews,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'kanbanAggregateOperationFieldMetadataId' })
  kanbanAggregateOperationFieldMetadata: Relation<FieldMetadataEntity>;

  @Column({
    type: 'enum',
    enum: Object.values(ViewCalendarLayout),
    nullable: true,
    default: null,
  })
  calendarLayout: ViewCalendarLayout | null;

  @Column({ nullable: true, type: 'uuid' })
  calendarFieldMetadataId: string | null;

  @ManyToOne(
    () => FieldMetadataEntity,
    (fieldMetadata) => fieldMetadata.calendarViews,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'calendarFieldMetadataId' })
  calendarFieldMetadata: Relation<FieldMetadataEntity>;

  @Column({ nullable: true, type: 'uuid' })
  mainGroupByFieldMetadataId: string | null;

  @ManyToOne(
    () => FieldMetadataEntity,
    (fieldMetadata) => fieldMetadata.mainGroupByFieldMetadataViews,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'mainGroupByFieldMetadataId' })
  mainGroupByFieldMetadata: Relation<FieldMetadataEntity>;

  @Column({ nullable: false, default: false, type: 'boolean' })
  shouldHideEmptyGroups: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;

  @Column({ nullable: true, type: 'text', default: null })
  anyFieldFilterValue: string | null;

  @Column({
    type: 'enum',
    enum: Object.values(ViewVisibility),
    nullable: false,
    default: ViewVisibility.WORKSPACE,
  })
  visibility: ViewVisibility;

  @Column({ nullable: true, type: 'uuid' })
  createdByUserWorkspaceId: string | null;

  @ManyToOne(() => UserWorkspaceEntity, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'createdByUserWorkspaceId' })
  createdBy: Relation<UserWorkspaceEntity>;

  @OneToMany(() => ViewFieldEntity, (viewField) => viewField.view)
  viewFields: Relation<ViewFieldEntity[]>;

  @OneToMany(() => ViewFilterEntity, (viewFilter) => viewFilter.view)
  viewFilters: Relation<ViewFilterEntity[]>;

  @OneToMany(() => ViewSortEntity, (viewSort) => viewSort.view)
  viewSorts: Relation<ViewSortEntity[]>;

  @OneToMany(() => ViewGroupEntity, (viewGroup) => viewGroup.view)
  viewGroups: Relation<ViewGroupEntity[]>;

  @OneToMany(
    () => ViewFilterGroupEntity,
    (viewFilterGroup) => viewFilterGroup.view,
  )
  viewFilterGroups: Relation<ViewFilterGroupEntity[]>;
}
