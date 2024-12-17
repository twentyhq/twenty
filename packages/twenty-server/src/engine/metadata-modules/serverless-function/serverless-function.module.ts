import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { AnalyticsModule } from 'src/engine/core-modules/analytics/analytics.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ServerlessFunctionResolver } from 'src/engine/metadata-modules/serverless-function/serverless-function.resolver';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { BuildServerlessFunctionJob } from 'src/engine/metadata-modules/serverless-function/jobs/build-serverless-function.job';

@Module({
  imports: [
    FileUploadModule,
    NestjsQueryTypeOrmModule.forFeature([ServerlessFunctionEntity], 'metadata'),
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    FileModule,
    ThrottlerModule,
    AnalyticsModule,
  ],
  providers: [
    ServerlessFunctionService,
    ServerlessFunctionResolver,
    BuildServerlessFunctionJob,
  ],
  exports: [ServerlessFunctionService],
})
export class ServerlessFunctionModule {}
