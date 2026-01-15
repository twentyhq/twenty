import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SyncableEntityRequired } from 'src/engine/workspace-manager/types/syncable-entity-required.interface';

@Entity('frontComponent')
export class FrontComponentEntity
  extends SyncableEntityRequired
  implements Required<FrontComponentEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
