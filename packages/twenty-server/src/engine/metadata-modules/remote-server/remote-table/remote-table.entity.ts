import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import {
  RemoteServerEntity,
  type RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-related-entity';

@Entity('remoteTable')
export class RemoteTableEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  distantTableName: string;

  @Column({ nullable: false })
  localTableName: string;

  @Column({ nullable: false, type: 'uuid' })
  remoteServerId: string;

  @ManyToOne(() => RemoteServerEntity, (server) => server.syncedTables, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'remoteServerId' })
  server: Relation<RemoteServerEntity<RemoteServerType>>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
