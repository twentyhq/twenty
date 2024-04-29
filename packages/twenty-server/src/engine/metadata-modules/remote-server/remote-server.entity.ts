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
import { UserMappingOptionsInput as UserMappingOptions } from 'src/engine/metadata-modules/remote-server/utils/user-mapping-options.utils';

export enum RemoteServerType {
  POSTGRES_FDW = 'postgres_fdw',
}

type PostgresForeignDataWrapperOptions = {
  host: string;
  port: number;
  dbname: string;
};

export type ForeignDataWrapperOptions<T extends RemoteServerType> =
  T extends RemoteServerType.POSTGRES_FDW
    ? PostgresForeignDataWrapperOptions
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

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @OneToMany(() => RemoteTableEntity, (table) => table.server, {
    cascade: true,
  })
  tables: Relation<RemoteTableEntity[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
