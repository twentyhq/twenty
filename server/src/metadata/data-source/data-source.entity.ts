import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DataSourceOptions,
} from 'typeorm';

type DataSourceType = DataSourceOptions['type'];

@Entity('dataSource')
export class DataSourceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  schema: string;

  @Column({ type: 'enum', enum: ['postgres'], default: 'postgres' })
  type: DataSourceType;

  @Column({ nullable: true, name: 'label' })
  label: string;

  @Column({ default: false })
  isRemote: boolean;

  @Column({ nullable: false })
  workspaceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
