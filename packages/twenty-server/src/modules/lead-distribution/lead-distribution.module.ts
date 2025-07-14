import { Module } from '@nestjs/common';
import { LeadDistributionService } from './lead-distribution.service';
import { LeadDistributionController } from './lead-distribution.controller';

@Module({
  providers: [LeadDistributionService],
  controllers: [LeadDistributionController],
  exports: [LeadDistributionService],
})
export class LeadDistributionModule {}
