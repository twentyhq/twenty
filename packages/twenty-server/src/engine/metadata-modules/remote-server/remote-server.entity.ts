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

type PostgresForeignDataWrapperOptions = {
  host: string;
  port: number;
  dbname: string;
};

export type ForeignDataWrapperOptions<T extends RemoteServerType> =
  T extends RemoteServerType.POSTGRES_FDW
    ? PostgresForeignDataWrapperOptions
    : never;

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
  foreignDataWrapperId: string;

  @Column({ nullable: true })
  foreignDataWrapperType: T;

  @Column({ nullable: true, type: 'jsonb' })
  foreignDataWrapperOptions: ForeignDataWrapperOptions<T>;

  @Column({ nullable: true, type: 'jsonb' })
  userMappingOptions: UserMappingOptions;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
