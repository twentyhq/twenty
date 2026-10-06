import {
  DataSource,
  type EntityTarget,
  type ObjectLiteral,
  type Repository,
} from 'typeorm';

export const getCoreRepository = <Entity extends ObjectLiteral>(
  target: EntityTarget<Entity>,
): Repository<Entity> =>
  global.app.get(DataSource, { strict: false }).getRepository<Entity>(target);
