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

import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

@Entity({ name: 'viewSort', schema: 'core' })
@Index('IDX_VIEW_SORT_WORKSPACE_ID_VIEW_ID', ['workspaceId', 'viewId'])
@Index('IDX_VIEW_SORT_VIEW_ID', ['viewId'], {
  where: '"deletedAt" IS NULL',
})
@Index(
  'IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE',
  ['fieldMetadataId', 'viewId'],
  {
    unique: true,
    where: '"deletedAt" IS NULL',
  },
)
export class ViewSortEntity extends SyncableEntity {
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
    enum: Object.values(ViewSortDirection),
    default: ViewSortDirection.ASC,
  })
  direction: ViewSortDirection;

  @Column({ nullable: false, type: 'uuid' })
  viewId: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date | null;

  @ManyToOne(() => WorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @ManyToOne(() => ViewEntity, (view) => view.viewSorts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'viewId' })
  view: Relation<ViewEntity>;
}
