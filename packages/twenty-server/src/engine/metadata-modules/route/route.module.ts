import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RouteService } from 'src/engine/metadata-modules/route/route.service';
import { Route } from 'src/engine/metadata-modules/route/route.entity';
import { RouteController } from 'src/engine/metadata-modules/route/route.controller';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Route]),
    AuthModule,
    DomainManagerModule,
    ServerlessFunctionModule,
  ],
  controllers: [RouteController],
  providers: [RouteService],
})
export class RouteModule {}
