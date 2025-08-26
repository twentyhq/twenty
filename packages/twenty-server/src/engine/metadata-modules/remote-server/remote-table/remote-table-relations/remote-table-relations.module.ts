import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RemoteTableRelationsService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table-relations/remote-table-relations.service';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObjectMetadataEntity, FieldMetadataEntity]),
    WorkspaceMigrationModule,
  ],
  providers: [RemoteTableRelationsService],
  exports: [RemoteTableRelationsService],
})
export class RemoteTableRelationsModule {}
