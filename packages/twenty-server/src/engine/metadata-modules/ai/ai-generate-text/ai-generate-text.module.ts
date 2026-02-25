import { Module } from '@nestjs/common';

import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

import { AiGenerateTextController } from './controllers/ai-generate-text.controller';

@Module({
  imports: [PermissionsModule],
  controllers: [AiGenerateTextController],
})
export class AiGenerateTextModule {}
