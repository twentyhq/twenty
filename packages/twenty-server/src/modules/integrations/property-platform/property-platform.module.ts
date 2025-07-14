import { Module } from '@nestjs/common';
import { PropertyPlatformService } from './property-platform.service';
import { PropertyPlatformController } from './property-platform.controller';

@Module({
  providers: [PropertyPlatformService],
  controllers: [PropertyPlatformController],
  exports: [PropertyPlatformService],
})
export class PropertyPlatformModule {}
