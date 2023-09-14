import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// export const dataSourceEntity = new EntitySchema({
//   name: 'data_sources',
//   columns: {
//     id: {
//       primary: true,
//       type: 'uuid',
//       generated: 'uuid',
//     },
//     url: {
//       type: 'text',
//       nullable: true,
//     },
//     schema: {
//       type: 'text',
//       nullable: true,
//     },
//     type: {
//       type: 'text',
//       nullable: true,
//     },
//     name: {
//       type: 'text',
//       nullable: true,
//     },
//     is_remote: {
//       type: 'boolean',
//       nullable: true,
//       default: false,
//     },
//     workspace_id: {
//       type: 'uuid',
//       nullable: true,
//     },
//   },
// });

@Entity('data_source_metadata')
export class DataSourceMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  schema: string;

  @Column({ default: 'postgres' })
  type: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: false })
  is_remote: boolean;

  @Column({ nullable: false })
  workspace_id: string;
}
