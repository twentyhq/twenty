import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum ServerlessFunctionSyncStatus {
  NOT_READY = 'NOT_READY',
  READY = 'READY',
}

@Entity('serverlessFunction')
@Unique('IndexOnNameAndWorkspaceIdUnique', ['name', 'workspaceId'])
export class ServerlessFunctionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  sourceCodeHash: string;

  @Column({
    nullable: false,
    default: ServerlessFunctionSyncStatus.NOT_READY,
    type: 'enum',
    enum: ServerlessFunctionSyncStatus,
  })
  syncStatus: ServerlessFunctionSyncStatus;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
