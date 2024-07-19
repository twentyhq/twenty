import { Provider, Type } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { getWorkspaceRepositoryToken } from 'src/engine/twenty-orm/utils/get-workspace-repository-token.util';
import { TWENTY_ORM_WORKSPACE_DATASOURCE } from 'src/engine/twenty-orm/twenty-orm.constants';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

/**
 * Create providers for the given entities.
 */
export function createTwentyORMProviders(
  objects?: EntityClassOrSchema[],
): Provider[] {
  return (objects || []).map((object) => ({
    provide: getWorkspaceRepositoryToken(object),
    useFactory: async (
      dataSource: WorkspaceDataSource | null,
      entitySchemaFactory: EntitySchemaFactory,
    ) => {
      const objectMetadataName = convertClassNameToObjectMetadataName(
        (object as Type).name,
      );

      if (!dataSource) {
        // TODO: Throw here when the code is well architected
        return null;
      }

      const entitySchema = await entitySchemaFactory.create(
        dataSource.internalContext.workspaceId,
        objectMetadataName,
      );

      if (!entitySchema) {
        throw new Error('Entity schema not found');
      }

      return dataSource.getRepository(entitySchema);
    },
    inject: [TWENTY_ORM_WORKSPACE_DATASOURCE, EntitySchemaFactory],
  }));
}
