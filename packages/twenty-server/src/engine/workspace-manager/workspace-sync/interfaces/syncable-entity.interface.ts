import { Column, Index } from 'typeorm';

@Index(['workspaceId', 'universalIdentifier'], {
  unique: true,
})
export abstract class SyncableEntity {
  @Column({ nullable: true, type: 'text', default: null })
  universalIdentifier?: string | null;
}
