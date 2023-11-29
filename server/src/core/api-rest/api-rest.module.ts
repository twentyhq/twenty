import { Module } from '@nestjs/common';

import { ApiRestController } from 'src/core/api-rest/api-rest.controller';
import { ApiRestService } from 'src/core/api-rest/api-rest.service';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';

@Module({
  imports: [ObjectMetadataModule],
  controllers: [ApiRestController],
  providers: [ApiRestService],
})
export class ApiRestModule {}
