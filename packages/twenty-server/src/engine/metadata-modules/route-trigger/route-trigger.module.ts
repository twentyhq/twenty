import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { RouteTriggerController } from 'src/engine/metadata-modules/route-trigger/route-trigger.controller';
import { RouteTriggerService } from 'src/engine/metadata-modules/route-trigger/route-trigger.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogicFunctionEntity]),
    TokenModule,
    WorkspaceDomainsModule,
    LogicFunctionModule,
  ],
  controllers: [RouteTriggerController],
  providers: [RouteTriggerService],
  exports: [],
})
export class RouteTriggerModule {}
