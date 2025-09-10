import { Column, Index } from 'typeorm';

@Index(['workspaceId', 'universalIdentifier'], {
  unique: true,
})
export abstract class SyncableEntity {
  @Column({ nullable: true, type: 'uuid' })
  universalIdentifier: string | null;
}
