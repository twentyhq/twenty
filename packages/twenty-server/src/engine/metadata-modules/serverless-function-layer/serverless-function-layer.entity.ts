import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { PackageJson } from 'src/engine/core-modules/application/types/application.types';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

@Entity('serverlessFunctionLayer')
export class ServerlessFunctionLayerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', nullable: false })
  packageJson: PackageJson;

  @Column({ type: 'text', nullable: false })
  yarnLock: string;

  @Column({ type: 'text', nullable: false })
  checksum: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @OneToMany(
    () => ServerlessFunctionEntity,
    (serverlessFunction) => serverlessFunction.serverlessFunctionLayer,
    {
      onDelete: 'RESTRICT',
    },
  )
  serverlessFunctions: Relation<ServerlessFunctionEntity[]>;

  @OneToOne(
    () => ApplicationEntity,
    (application) => application.serverlessFunctionLayer,
    {
      nullable: true,
    },
  )
  application: Relation<ApplicationEntity> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
