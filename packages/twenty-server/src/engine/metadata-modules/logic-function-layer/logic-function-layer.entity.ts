import { PackageJson } from 'twenty-shared/application';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity('logicFunctionLayer')
export class LogicFunctionLayerEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', nullable: false })
  packageJson: PackageJson;

  @Column({ type: 'text', nullable: false })
  yarnLock: string;

  @Column({ type: 'text', nullable: false })
  checksum: string;

  @OneToMany(
    () => LogicFunctionEntity,
    (logicFunction) => logicFunction.logicFunctionLayer,
    {
      onDelete: 'RESTRICT',
    },
  )
  logicFunctions: Relation<LogicFunctionEntity[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
