import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { PackageJson } from 'twenty-shared/application';

import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
