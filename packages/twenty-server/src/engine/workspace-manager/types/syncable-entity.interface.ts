import { Column, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import type { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Index(['workspaceId', 'universalIdentifier'], {
  unique: true,
})
export abstract class SyncableEntity extends WorkspaceRelatedEntity {
  @Column({ nullable: false, type: 'uuid' })
  universalIdentifier: string;

  @Column({ nullable: false, type: 'uuid' })
  applicationId: string;

  @ManyToOne('ApplicationEntity', {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'applicationId' })
  application: Relation<ApplicationEntity>;
}
