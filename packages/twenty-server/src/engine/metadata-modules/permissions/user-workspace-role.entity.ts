import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { RoleEntity } from 'src/engine/metadata-modules/permissions/role.entity';

@Entity('userWorkspaceRole')
@Unique('IndexOnUserWorkspaceRoleUnique', ['userWorkspaceId', 'roleId'])
export class UserWorkspaceRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @ManyToOne(() => RoleEntity, (role) => role.userWorkspaceRoles, {
    onDelete: 'CASCADE',
  })
  role: Relation<RoleEntity>;

  @Column({ nullable: false, type: 'uuid' })
  userWorkspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
