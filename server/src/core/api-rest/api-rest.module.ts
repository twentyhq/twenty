import { Module } from '@nestjs/common';

import { ApiRestController } from 'src/core/api-rest/api-rest.controller';

@Module({
  controllers: [ApiRestController],
})
export class ApiRestModule {}
