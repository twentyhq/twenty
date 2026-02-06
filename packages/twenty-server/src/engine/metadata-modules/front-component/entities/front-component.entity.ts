import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity('frontComponent')
export class FrontComponentEntity
  extends SyncableEntity
  implements Required<FrontComponentEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true, type: 'varchar' })
  description: string | null;

  @Column({ nullable: false })
  sourceComponentPath: string;

  @Column({ nullable: false })
  builtComponentPath: string;

  @Column({ nullable: false })
  componentName: string;

  @Column({ nullable: false })
  builtComponentChecksum: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
