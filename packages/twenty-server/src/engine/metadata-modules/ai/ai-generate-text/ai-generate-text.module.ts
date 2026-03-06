import { Module } from '@nestjs/common';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

import { AiGenerateTextController } from './controllers/ai-generate-text.controller';

@Module({
  imports: [TokenModule, WorkspaceCacheStorageModule, PermissionsModule],
  controllers: [AiGenerateTextController],
})
export class AiGenerateTextModule {}
