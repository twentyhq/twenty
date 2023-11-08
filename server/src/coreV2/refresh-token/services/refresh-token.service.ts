import { RefreshToken } from '@prisma/client';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';

export class RefreshTokenService extends TypeOrmQueryService<RefreshToken> {}
