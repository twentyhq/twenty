import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Relation,
    Unique,
    UpdateDateColumn,
} from 'typeorm';

import { RoleInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/role.interface';

import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/permissions/user-workspace-role.entity';

@Entity('role')
@Unique('IndexOnNameAndWorkspaceIdUnique', ['name', 'workspaceId'])
export class RoleEntity implements RoleInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  dataSourceId: string;

  @ManyToOne(() => DataSourceEntity, (dataSource) => dataSource.objects, {
    onDelete: 'CASCADE',
  })
  dataSource: Relation<DataSourceEntity>;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  label: string;

  @Column({ nullable: false, default: false })
  canUpdateAllSettings: boolean;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: false, default: true })
  isEditable: boolean;

  @OneToMany(
    () => UserWorkspaceRoleEntity,
    (userWorkspaceRole: UserWorkspaceRoleEntity) => userWorkspaceRole.role,
  )
  userWorkspaceRoles: Relation<UserWorkspaceRoleEntity[]>;
}
