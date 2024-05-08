import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  Relation,
} from 'typeorm';

import {
  RemoteServerEntity,
  RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';

@Entity('remoteTable')
export class RemoteTableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  distantTableName: string;

  @Column({ nullable: false })
  localTableName: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

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
