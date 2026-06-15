import { type EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type ObjectLiteral, type Repository } from 'typeorm';

export const getCoreRepository = <Entity extends ObjectLiteral>(
  target: EntityClassOrSchema,
): Repository<Entity> =>
  global.app.get<Repository<Entity>>(getRepositoryToken(target), {
    strict: false,
  });
