import {
  type DynamicModule,
  Global,
  Module,
  type Provider,
} from '@nestjs/common';

import { capitalize } from 'twenty-shared/utils';

import { metadataToRepositoryMapping } from 'src/engine/object-metadata-repository/metadata-to-repository.mapping';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

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
        useFactory: (globalWorkspaceOrmManager: GlobalWorkspaceOrmManager) => {
          return new repositoryClass(globalWorkspaceOrmManager);
        },
        inject: [GlobalWorkspaceOrmManager],
      };
    });

    return {
      module: ObjectMetadataRepositoryModule,
      imports: [WorkspaceDataSourceModule, TwentyORMModule],
      providers: [...providers],
      exports: providers,
    };
  }
}
