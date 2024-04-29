import { Provider, Type } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { DataSource } from 'typeorm';

import { getWorkspaceRepositoryToken } from 'src/engine/twenty-orm/utils/get-workspace-repository-token.util';
import { TWENTY_ORM_WORKSPACE_DATASOURCE } from 'src/engine/twenty-orm/twenty-orm.constants';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';

/**
 * Create providers for the given entities.
 */
export function createTwentyORMProviders(
  objects?: EntityClassOrSchema[],
): Provider[] {
  return (objects || []).map((object) => ({
    provide: getWorkspaceRepositoryToken(object),
    useFactory: (
      dataSource: DataSource,
      entitySchemaFactory: EntitySchemaFactory,
    ) => {
      const entity = entitySchemaFactory.create(object as Type);

      return dataSource.getRepository(entity);
    },
    inject: [TWENTY_ORM_WORKSPACE_DATASOURCE, EntitySchemaFactory],
  }));
}
