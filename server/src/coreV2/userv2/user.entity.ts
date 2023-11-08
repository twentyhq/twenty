import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { RefreshToken } from 'src/coreV2/refresh-token/refresh-token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ default: false })
  emailVerified: boolean;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];
}
