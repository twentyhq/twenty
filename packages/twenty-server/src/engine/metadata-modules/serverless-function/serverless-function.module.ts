import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { AnalyticsModule } from 'src/engine/core-modules/analytics/analytics.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { ServerlessFunctionPublicationListener } from 'src/engine/metadata-modules/serverless-function/listeners/serverless-function-publication.listener';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ServerlessFunctionResolver } from 'src/engine/metadata-modules/serverless-function/serverless-function.resolver';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { CodeIntrospectionModule } from 'src/modules/code-introspection/code-introspection.module';

@Module({
  imports: [
    FileUploadModule,
    NestjsQueryTypeOrmModule.forFeature([ServerlessFunctionEntity], 'metadata'),
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    FileModule,
    ThrottlerModule,
    AnalyticsModule,
    CodeIntrospectionModule,
  ],
  providers: [
    ServerlessFunctionService,
    ServerlessFunctionResolver,
    ServerlessFunctionPublicationListener,
  ],
  exports: [ServerlessFunctionService],
})
export class ServerlessFunctionModule {}
