import { TokenEntity } from './token.entity';
import { User } from '@prisma/client';

export class VerifyEntity {
  user: User;

  tokens: {
    accessToken: TokenEntity;
    refreshToken: TokenEntity;
  };
}
