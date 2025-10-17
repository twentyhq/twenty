import { Column, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

@Index(['workspaceId', 'universalIdentifier'], {
  unique: true,
})
export abstract class SyncableEntity {
  @Column({ nullable: true, type: 'uuid' })
  universalIdentifier: string | null;

  @Column({ nullable: true, type: 'uuid' })
  applicationId: string | null;

  @ManyToOne(() => ApplicationEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'applicationId' })
  application: Relation<ApplicationEntity>;
}
