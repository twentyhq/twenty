import { Controller, Post, Body, Get } from '@nestjs/common';
import { LeadDistributionService } from './lead-distribution.service';

@Controller('lead-distribution')
export class LeadDistributionController {
  constructor(private readonly leadDistributionService: LeadDistributionService) {}

  @Get('config')
  async getLeadDistributionConfig() {
    return this.leadDistributionService.getLeadDistributionConfig();
  }

  @Post('config')
  async setLeadDistributionConfig(@Body() config: any) {
    await this.leadDistributionService.setLeadDistributionConfig(config);
    return { message: 'Configuration saved successfully' };
  }
}
