import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RemoteServerType {
  POSTGRES_FDW = 'postgres_fdw',
}

type PostgresFdwOptions = {
  host: string;
  port: number;
  dbname: string;
};

export type FdwOptions<T extends RemoteServerType> =
  T extends RemoteServerType.POSTGRES_FDW ? PostgresFdwOptions : never;

export type UserMappingOptions = {
  username: string;
  password: string;
};

@Entity('remoteServer')
@ObjectType('RemoteServer')
export class RemoteServerEntity<T extends RemoteServerType> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Generated('uuid')
  fdwId: string;

  @Column({ nullable: true })
  fdwType: T;

  @Column({ nullable: true, type: 'jsonb' })
  fdwOptions: FdwOptions<T>;

  @Column({ nullable: true, type: 'jsonb' })
  userMappingOptions: UserMappingOptions;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
