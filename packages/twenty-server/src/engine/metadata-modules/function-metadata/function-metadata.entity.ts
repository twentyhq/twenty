import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum FunctionSyncStatus {
  NOT_READY = 'NOT_READY',
  READY = 'READY',
}

@Entity('functionMetadata')
@Unique('IndexOnNameAndWorkspaceIdUnique', ['name', 'workspaceId'])
export class FunctionMetadataEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  sourceCodePath: string;

  @Column({ nullable: false })
  buildSourcePath: string;

  @Column({
    nullable: false,
    default: FunctionSyncStatus.NOT_READY,
    type: 'enum',
    enum: FunctionSyncStatus,
  })
  syncStatus: FunctionSyncStatus;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
