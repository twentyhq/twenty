import { ID } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ default: false })
  emailVerified: boolean;
}
