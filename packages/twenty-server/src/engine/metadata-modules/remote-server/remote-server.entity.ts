import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { RemoteTableEntity } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.entity';
import { UserMappingOptions } from 'src/engine/metadata-modules/remote-server/types/user-mapping-options';
import { DistantTables } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/types/distant-table';

export enum RemoteServerType {
  POSTGRES_FDW = 'postgres_fdw',
  STRIPE_FDW = 'stripe_fdw',
}

type PostgresForeignDataWrapperOptions = {
  host: string;
  port: number;
  dbname: string;
};

type StripeForeignDataWrapperOptions = {
  api_key: string;
};

export type ForeignDataWrapperOptions<T extends RemoteServerType> =
  T extends RemoteServerType.POSTGRES_FDW
    ? PostgresForeignDataWrapperOptions
    : T extends RemoteServerType.STRIPE_FDW
      ? StripeForeignDataWrapperOptions
      : never;

@Entity('remoteServer')
export class RemoteServerEntity<T extends RemoteServerType> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Generated('uuid')
  foreignDataWrapperId: string;

  @Column({ type: 'text', nullable: true })
  foreignDataWrapperType: T;

  @Column({ nullable: true, type: 'jsonb' })
  foreignDataWrapperOptions: ForeignDataWrapperOptions<T>;

  @Column({ nullable: true, type: 'jsonb' })
  userMappingOptions: UserMappingOptions;

  @Column({ type: 'text', nullable: true })
  schema: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Column({ type: 'jsonb', nullable: true })
  availableTables: DistantTables;

  @OneToMany(() => RemoteTableEntity, (table) => table.server, {
    cascade: true,
  })
  syncedTables: Relation<RemoteTableEntity[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
