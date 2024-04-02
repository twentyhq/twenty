import { Global, Module, DynamicModule, Provider } from '@nestjs/common';

import { metadataToRepositoryMapping } from 'src/engine/object-metadata-repository/metadata-to-repository.mapping';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { capitalize } from 'src/utils/capitalize';

@Global()
@Module({})
export class ObjectMetadataRepositoryModule {
  static forFeature(objectMetadatas): DynamicModule {
    const providers: Provider[] = objectMetadatas.map((objectMetadata) => {
      const repositoryClass = metadataToRepositoryMapping[objectMetadata.name];

      if (!repositoryClass) {
        throw new Error(`No repository found for ${objectMetadata.name}`);
      }

      return {
        provide: `${capitalize(
          convertClassNameToObjectMetadataName(objectMetadata.name),
        )}Repository`,
        useFactory: (
          workspaceDataSourceService: WorkspaceDataSourceService,
        ) => {
          return new repositoryClass(workspaceDataSourceService);
        },
        inject: [WorkspaceDataSourceService],
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
