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

export type FdwOptions = PostgresFdwOptions;

export type UserMappingOptions = {
  username: string;
  password: string;
};

@Entity('remoteServer')
export class RemoteServerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Generated('uuid')
  fdwId: string;

  @Column({ nullable: true })
  fdwType: RemoteServerType;

  @Column({ nullable: true, type: 'jsonb' })
  fdwOptions: FdwOptions;

  @Column({ nullable: true, type: 'jsonb' })
  userMappingOptions: UserMappingOptions;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
