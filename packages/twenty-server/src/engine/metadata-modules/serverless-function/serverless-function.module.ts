import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ServerlessFunctionResolver } from 'src/engine/metadata-modules/serverless-function/serverless-function.resolver';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';

@Module({
  imports: [
    FileUploadModule,
    NestjsQueryTypeOrmModule.forFeature([ServerlessFunctionEntity], 'core'),
    TypeOrmModule.forFeature([FeatureFlag], 'core'),
    FileModule,
    ThrottlerModule,
    AuditModule,
    FeatureFlagModule,
  ],
  providers: [ServerlessFunctionService, ServerlessFunctionResolver],
  exports: [ServerlessFunctionService],
})
export class ServerlessFunctionModule {}
