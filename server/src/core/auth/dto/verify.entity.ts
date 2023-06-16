import { TokenEntity } from './token.entity';
import { User } from '@prisma/client';

export class VerifyEntity {
  user: Omit<User, 'passwordHash'>;

  tokens: {
    accessToken: TokenEntity;
    refreshToken: TokenEntity;
  };
}
