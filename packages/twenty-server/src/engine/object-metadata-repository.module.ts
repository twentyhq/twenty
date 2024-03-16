import { Global, Module, DynamicModule } from '@nestjs/common';

import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

@Global()
@Module({})
export class ObjectMetadataRepositoryModule {
  static forFeature(entities: any): DynamicModule {
    const providers = entities.map((entity) => ({
      provide: `${convertClassNameToObjectMetadataName(entity.name)}Repository`,
      useClass: entity,
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
