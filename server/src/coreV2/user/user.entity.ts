import { ID, Field, ObjectType } from '@nestjs/graphql';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { IDField } from '@ptc-org/nestjs-query-graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

import { RefreshToken } from 'src/coreV2/refresh-token/refresh-token.entity';

@Entity('users')
@ObjectType('user')
// @Authorize({
//   authorize: (context: any) => ({
//     // FIXME: We do not have this relation in the database
//     workspaceMember: {
//       workspaceId: { eq: context?.req?.user?.workspace?.id },
//     },
//   }),
// })
export class User {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: true })
  firstName: string;

  @Field()
  @Column({ nullable: true })
  lastName: string;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column({ default: false })
  emailVerified: boolean;

  @Field()
  @Column({ nullable: true })
  avatarUrl: string;

  @Field()
  @Column()
  locale: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phoneNumber: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  lastSeen: Date;

  @Field({ nullable: true })
  @Column({ default: false })
  disabled: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  passwordHash: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Field()
  @Column({ default: false })
  canImpersonate: boolean;

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deletedAt: Date;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];
}
