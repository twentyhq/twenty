import { ObjectType } from '@nestjs/graphql';

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
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

@Entity({ name: 'pageLayout', schema: 'core' })
@ObjectType('PageLayout')
@Index(
  'IDX_PAGE_LAYOUT_WORKSPACE_ID_OBJECT_METADATA_ID',
  ['workspaceId', 'objectMetadataId'],
  { where: '"deletedAt" IS NULL' },
)
export class PageLayoutEntity
  extends SyncableEntity
  implements Required<PageLayoutEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({
    type: 'enum',
    enum: Object.values(PageLayoutType),
    nullable: false,
    default: PageLayoutType.RECORD_PAGE,
  })
  type: PageLayoutType;

  @Column({ nullable: true, type: 'uuid' })
  objectMetadataId: string | null;

  @ManyToOne(() => ObjectMetadataEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity> | null;

  @OneToMany(() => PageLayoutTabEntity, (tab) => tab.pageLayout, {
    cascade: true,
  })
  tabs: Relation<PageLayoutTabEntity[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
