import { type EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { type DataSource, type ObjectLiteral, type Repository } from 'typeorm';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

// The app is built in globalSetup, so classes imported by a test are not the
// ones it registered: resolve the data source and the entity by name.
export const getCoreRepository = <Entity extends ObjectLiteral>(
  target: EntityClassOrSchema,
): Repository<Entity> =>
  getAppProviderByClassName<DataSource>('DataSource').getRepository<Entity>(
    typeof target === 'function' ? target.name : target.options.name,
  );
