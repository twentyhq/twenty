import { Column, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import type { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-related-entity';

@Index(['workspaceId', 'universalIdentifier'], {
  unique: true,
})
export abstract class SyncableEntity extends WorkspaceRelatedEntity {
  @Column({ nullable: true, type: 'uuid' })
  // TODO should not be nullable
  universalIdentifier: string;

  @Column({ nullable: true, type: 'uuid' })
  applicationId: string | null;

  @ManyToOne('ApplicationEntity', {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'applicationId' })
  application: Relation<ApplicationEntity>;
}
