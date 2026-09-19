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

import { type DeferredSchemaOperationStatus } from 'src/engine/metadata-modules/deferred-schema-operation/types/deferred-schema-operation-status.type';
import { type DeferredSchemaOperationType } from 'src/engine/metadata-modules/deferred-schema-operation/types/deferred-schema-operation-type.type';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Index('IDX_DEFERRED_SCHEMA_OPERATION_WORKSPACE_ID_STATUS', [
  'workspaceId',
  'status',
])
@Entity({ name: 'deferredSchemaOperation', schema: 'core' })
export class DeferredSchemaOperationEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  type: DeferredSchemaOperationType;

  @Column({ type: 'text', default: 'PENDING' })
  status: DeferredSchemaOperationStatus;

  @Index('IDX_DEFERRED_SCHEMA_OPERATION_INDEX_METADATA_ID_UNIQUE', {
    unique: true,
  })
  @Column({ type: 'uuid' })
  indexMetadataId: string;

  @ManyToOne(() => IndexMetadataEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'indexMetadataId' })
  indexMetadata: Relation<IndexMetadataEntity>;

  @Column({ type: 'integer', default: 0 })
  attempts: number;

  @Column({ type: 'text', nullable: true })
  lastError: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
