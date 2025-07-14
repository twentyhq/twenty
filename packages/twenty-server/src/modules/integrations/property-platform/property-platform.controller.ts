import { Controller, Get, Query } from '@nestjs/common';
import { PropertyPlatformService } from './property-platform.service';

@Controller('integrations/property-platform')
export class PropertyPlatformController {
  constructor(private readonly propertyPlatformService: PropertyPlatformService) {}

  @Get('listings')
  async getListings(@Query() params: any) {
    return this.propertyPlatformService.getListings(params);
  }
}
