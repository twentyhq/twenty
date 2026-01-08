import { ViewFilterOperand } from 'twenty-shared/types';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { type ViewFilterValue } from 'src/engine/metadata-modules/view-filter/types/view-filter-value.type';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

@Entity({ name: 'viewFilter', schema: 'core' })
@Index('IDX_VIEW_FILTER_WORKSPACE_ID_VIEW_ID', ['workspaceId', 'viewId'])
@Index('IDX_VIEW_FILTER_VIEW_ID', ['viewId'], {
  where: '"deletedAt" IS NULL',
})
@Index('IDX_VIEW_FILTER_FIELD_METADATA_ID', ['fieldMetadataId'])
export class ViewFilterEntity
  extends SyncableEntity
  implements Required<ViewFilterEntity>
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

  @Column({
    nullable: false,
    type: 'enum',
    enum: Object.values(ViewFilterOperand),
    default: ViewFilterOperand.CONTAINS,
  })
  operand: ViewFilterOperand;

  @Column({ nullable: false, type: 'jsonb' })
  value: ViewFilterValue;

  @Column({ nullable: true, type: 'uuid' })
  viewFilterGroupId: string | null;

  @Column({ nullable: true, type: 'double precision' })
  positionInViewFilterGroup: number | null;

  @Column({ nullable: true, type: 'text', default: null })
  subFieldName: string | null;

  @Column({ nullable: false, type: 'uuid' })
  viewId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;

  @ManyToOne(() => ViewEntity, (view) => view.viewFilters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'viewId' })
  view: Relation<ViewEntity>;

  @ManyToOne(
    () => ViewFilterGroupEntity,
    (viewFilterGroup) => viewFilterGroup.viewFilters,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'viewFilterGroupId' })
  viewFilterGroup: Relation<ViewFilterGroupEntity>;
}
