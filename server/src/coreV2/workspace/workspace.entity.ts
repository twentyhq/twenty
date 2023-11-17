import { Field, ID, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('workspaceV2')
@ObjectType('workspaceV2')
export class Workspace {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  domainName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  inviteHash?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deletedAt?: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
