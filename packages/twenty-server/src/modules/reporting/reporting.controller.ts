import { Controller, Get, Query } from '@nestjs/common';
import { ReportingService } from './reporting.service';

@Controller('reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get()
  async getReport(@Query('name') reportName: string, @Query() params: any) {
    return this.reportingService.getReport(reportName, params);
  }
}
