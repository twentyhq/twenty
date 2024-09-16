import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';

import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';

export class IndexMetadataService extends TypeOrmQueryService<IndexMetadataEntity> {
  //   override async createOne(
  //     fieldMetadataInput: CreateFieldInput,
  //   ): Promise<FieldMetadataEntity> {
  //     const createIndexWorkspaceMigrations =
  //       await this.workspaceMigrationIndexFactory.create(
  //         originalObjectMetadataCollection,
  //         metadataIndexUpdaterResult.createdIndexMetadataCollection,
  //         WorkspaceMigrationBuilderAction.CREATE,
  //       );
  //   }
}
