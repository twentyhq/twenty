import { Column, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import type { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceBoundEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-bound-entity';

@Index(['workspaceId', 'universalIdentifier'], {
  unique: true,
})
export abstract class SyncableEntity extends WorkspaceBoundEntity {
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
