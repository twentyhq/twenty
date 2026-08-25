import {
  type DynamicModule,
  Global,
  Module,
  type Provider,
} from '@nestjs/common';

import { capitalize } from 'twenty-shared/utils';

import { metadataToRepositoryMapping } from 'src/engine/object-metadata-repository/metadata-to-repository.mapping';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/utils/convert-class-to-object-metadata-name.util';

@Global()
@Module({})
export class ObjectMetadataRepositoryModule {
  // @ts-expect-error legacy noImplicitAny
  static forFeature(objectMetadatas): DynamicModule {
    // @ts-expect-error legacy noImplicitAny
    const providers: Provider[] = objectMetadatas.map((objectMetadata) => {
      // @ts-expect-error legacy noImplicitAny
      const repositoryClass = metadataToRepositoryMapping[objectMetadata.name];

      if (!repositoryClass) {
        throw new Error(`No repository found for ${objectMetadata.name}`);
      }

      return {
        provide: `${capitalize(
          convertClassNameToObjectMetadataName(objectMetadata.name),
        )}Repository`,
        useFactory: (workspaceOrmManager: WorkspaceOrmManager) => {
          return new repositoryClass(workspaceOrmManager);
        },
        inject: [WorkspaceOrmManager],
      };
    });

    return {
      module: ObjectMetadataRepositoryModule,
      imports: [WorkspaceDataSourceModule],
      providers: [...providers],
      exports: providers,
    };
  }
}
