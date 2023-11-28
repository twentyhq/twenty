import { Module } from '@nestjs/common';

import { ApiRestController } from 'src/core/api-rest/api-rest.controller';
import { ApiRestService } from 'src/core/api-rest/api-rest.service';

@Module({
  controllers: [ApiRestController],
  providers: [ApiRestService],
})
export class ApiRestModule {}
