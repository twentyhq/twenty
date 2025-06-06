import { Module } from '@nestjs/common';

import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { SeederService } from 'src/engine/workspace-manager/seed-dev/dev-seeder.service';

@Module({
  imports: [
    ObjectMetadataModule,
    FieldMetadataModule,
    WorkspaceDataSourceModule,
  ],
  exports: [SeederService],
  providers: [SeederService],
})
export class SeederModule {}
