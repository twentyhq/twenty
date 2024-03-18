import { Global, Module, DynamicModule, Provider } from '@nestjs/common';

import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { capitalize } from 'src/utils/capitalize';

@Global()
@Module({})
export class ObjectMetadataRepositoryModule {
  static forFeature(repositories): DynamicModule {
    const providers: Provider[] = repositories.map((repository) => ({
      provide: `${capitalize(
        convertClassNameToObjectMetadataName(repository.name),
      )}Repository`,
      useFactory: (workspaceDataSourceService: WorkspaceDataSourceService) => {
        return new repository(workspaceDataSourceService);
      },
      inject: [WorkspaceDataSourceService],
    }));

    return {
      module: ObjectMetadataRepositoryModule,
      imports: [WorkspaceDataSourceModule],
      providers: [...providers],
      exports: providers,
    };
  }
}
