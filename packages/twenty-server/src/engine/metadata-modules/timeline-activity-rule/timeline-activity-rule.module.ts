import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TimelineActivityRuleEntity } from 'src/engine/metadata-modules/timeline-activity-rule/entities/timeline-activity-rule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimelineActivityRuleEntity])],
  providers: [],
  exports: [],
})
export class TimelineActivityRuleModule {}
