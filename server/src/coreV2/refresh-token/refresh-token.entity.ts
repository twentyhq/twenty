import { Field, ID, ObjectType } from '@nestjs/graphql';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  Authorize,
  BeforeCreateOne,
  IDField,
} from '@ptc-org/nestjs-query-graphql';

import { UserV2 } from 'src/coreV2/user/user.entity';

import { BeforeCreateOneRefreshToken } from './hooks/before-create-one-refresh-token.hook';

@Entity('refresh_tokens')
@ObjectType('refreshTokenV2')
@BeforeCreateOne(BeforeCreateOneRefreshToken)
@Authorize({
  authorize: (context: any) => ({
    userId: { eq: context?.req?.user?.user?.id },
  }),
})
export class RefreshToken {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserV2, (user) => user.refreshTokens)
  @JoinColumn({ name: 'userId' })
  user: UserV2;

  @Column()
  userId: string;

  @Field()
  @Column('time with time zone')
  expiresAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  deletedAt: Date | null;

  @Column('timestamp with time zone', { nullable: true })
  revokedAt: Date | null;

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
